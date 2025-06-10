import { Hono } from "hono";
import { apiKeyAuth } from "../middleware/auth.ts";
import {
  CacheEndpointRequest,
  KV,
  LinearItem,
  LinearReturn,
} from "../utils/types.ts";
import { LinearClient } from "@linear/sdk";

export class LinearTrmnl {
  app;
  kv: KV;
  linearClient: LinearClient;

  constructor(kv: KV, linear_api_key: string) {
    this.app = new Hono();
    this.kv = kv;
    this.linearClient = new LinearClient({
      apiKey: linear_api_key,
    });

    this.app.use("/*", apiKeyAuth);

    this.app.post("/cache", async (c) => {
      const request = await c.req.json<CacheEndpointRequest>();
      if (request.action === "refresh") {
        const issues = await this.getMyIssues();
        // 25 minute expiration time
        const expireIn = 25 * 60 * 1000;
        await this.kv.set("cache", issues, expireIn);
        return c.json({ issues });
      } else if (request.action === "clear") {
        await this.kv.clear("cache");
        return c.json({ message: "Cache cleared" });
      }
    });

    this.app.get("/", async (c) => {
      console.log("received request");
      const cached = await kv.get("cache");
      if (cached !== undefined) {
        const issues = cached;
        console.log("serving cached value");
        return c.json({ issues });
      }
      const issues = await this.getMyIssues();
      // 25 minute expiration time
      const expireIn = 25 * 60 * 1000;
      await this.kv.set("cache", issues, expireIn);
      return c.json({ issues });
    });
  }
  async getMyIssues(): Promise<LinearReturn> {
    const me = await this.linearClient.viewer;
    const teams = await me.teams();
    const myIssues = await me.assignedIssues();

    if (!myIssues.nodes.length) return new LinearReturn();
    if (!teams.nodes.length) return new LinearReturn();

    const currentCycle = await teams.nodes[0].cycles({
      filter: {
        isActive: { eq: true },
      },
    });
    if (!currentCycle) return new LinearReturn();
    const cycle = currentCycle.nodes[0];

    const result = new LinearReturn();

    for (const issue of myIssues.nodes) {
      const state = await issue.state;
      const issueCycle = await issue.cycle;

      if (state !== undefined) {
        const item: LinearItem = {
          title: issue.title,
          description: issue.description,
        };
        if (issue.project !== undefined) {
          item.project = (await issue.project).name;
        }

        if (!issueCycle !== undefined) {
          if (issueCycle?.id !== cycle.id) {
            continue;
          }
        }

        if (state.name === "Todo") {
          result.todo.push(item);
        } else if (state.name === "Backlog") {
          result.backlog.push(item);
        }
      }
    }

    return result;
  }
}
