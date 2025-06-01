import { Hono } from "hono";
import { LinearClient } from "@linear/sdk";

type LinearItem = {
  title: string;
  description?: string;
  project?: string;
};

class LinearReturn {
  todo: Array<LinearItem>;
  backlog: Array<LinearItem>;

  constructor() {
    this.todo = [];
    this.backlog = [];
  }
}

const app = new Hono();
const linear_api_token = Deno.env.get("LINEAR_API_TOKEN");
const linearClient = new LinearClient({
  apiKey: linear_api_token,
});

let last_response: {
  time: Date;
  resp: LinearReturn;
} | null = null;

// Configuration for auto-refresh (configurable via environment variables)
const CACHE_DURATION_MS = parseInt(Deno.env.get("CACHE_DURATION_MINUTES") || "30") * 60 * 1000;
const REFRESH_INTERVAL_MS = parseInt(Deno.env.get("REFRESH_INTERVAL_MINUTES") || "15") * 60 * 1000;

// Background refresh function
async function refreshIssuesCache() {
  try {
    console.log('Refreshing issues cache...');
    const issues = await getMyIssues();
    last_response = {
      time: new Date(),
      resp: issues,
    };
    console.log('Issues cache refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh issues cache:', error);
  }
}

// Start background refresh timer
console.log(`Starting background refresh timer (every ${REFRESH_INTERVAL_MS / 60000} minutes)...`);
setInterval(refreshIssuesCache, REFRESH_INTERVAL_MS);

// Initial cache load
refreshIssuesCache();

async function getMyIssues() {
  const me = await linearClient.viewer;
  const myIssues = await me.assignedIssues();

  if (!myIssues.nodes.length) return new LinearReturn();

  const result = new LinearReturn();

  for (const issue of myIssues.nodes) {
    const state = await issue.state;
    if (state !== undefined) {
      const item: LinearItem = {
        title: issue.title,
        description: issue.description,
      };
      if (issue.project !== undefined) {
        item.project = (await issue.project).name;
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

app.get("/", async (c) => {
  const now = new Date();

  // Check if we have a cached response and it's still valid
  if (
    last_response &&
    (now.getTime() - last_response.time.getTime()) < CACHE_DURATION_MS
  ) {
    return c.json({ 
      issues: last_response.resp,
      cached: true,
      lastRefresh: last_response.time.toISOString()
    });
  }

  // Cache is expired or doesn't exist, fetch new data immediately
  await refreshIssuesCache();

  return c.json({ 
    issues: last_response?.resp || new LinearReturn(),
    cached: false,
    lastRefresh: last_response?.time.toISOString(),
    refreshIntervalMinutes: REFRESH_INTERVAL_MS / 60000,
    cacheDurationMinutes: CACHE_DURATION_MS / 60000
  });
});

// Manual refresh endpoint
app.post("/refresh", async (c) => {
  await refreshIssuesCache();
  
  return c.json({
    message: "Cache refreshed successfully",
    lastRefresh: last_response?.time.toISOString(),
    issues: last_response?.resp || new LinearReturn()
  });
});

// Health check endpoint with cache status
app.get("/health", (c) => {
  const now = new Date();
  const cacheAge = last_response ? now.getTime() - last_response.time.getTime() : null;
  const isCacheValid = cacheAge !== null && cacheAge < CACHE_DURATION_MS;
  
  return c.json({
    status: "healthy",
    lastRefresh: last_response?.time.toISOString() || null,
    cacheAgeMinutes: cacheAge ? Math.round(cacheAge / 60000) : null,
    isCacheValid,
    refreshIntervalMinutes: REFRESH_INTERVAL_MS / 60000,
    cacheDurationMinutes: CACHE_DURATION_MS / 60000
  });
});

Deno.serve(app.fetch);
