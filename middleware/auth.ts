import { createMiddleware } from "hono/factory";

const API_KEY = Deno.env.get("API_KEY");

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const providedKey = c.req.header("API-Key");

  if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
  }

  if (!providedKey) {
    return c.json({
      error: "API key required",
    }, 401);
  }

  if (providedKey !== API_KEY) {
    return c.json({ error: "Invalid key" }, 403);
  }

  await next();
});
