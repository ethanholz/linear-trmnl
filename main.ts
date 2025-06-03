import { DenoKV } from "./utils/types.ts";
import { LinearTrmnl } from "./api/api.ts";

const linear_api_token = Deno.env.get("LINEAR_API_TOKEN");
const base_kv = await Deno.openKv();
const kv = new DenoKV(base_kv);
if (linear_api_token === undefined) {
  throw Error("LINEAR_API_TOKEN is not set");
}
const app = new LinearTrmnl(kv, linear_api_token);

Deno.serve(app.app.fetch);
