import Redis from "ioredis";
import type { VercelRequest, VercelResponse } from "@vercel/node";
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}
const client = new Redis(REDIS_URL);
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  const { method, query, body } = req;
  const { searchTerm, searchValue } = query as Record<string, string>;

  try {
    const cacheKey = `${searchValue}:${searchTerm}`;

    if (method === "GET") {
      try {
        const exists = await client.exists(cacheKey);
        if (exists) {
          console.log(`Show ${cacheKey} from cache`);
          let result = await client.get(cacheKey);
          result = JSON.parse(result || "{}");
          return res.status(200).json(result);
        }
        return res.status(404).json({ error: `No cache found for ${cacheKey}` });
      } catch (error) {
        console.error("Error accessing Redis cache:", error);
        return res.status(500).json({ error: "Error accessing Redis cache" });
      }
    }

    if (method === "POST") {
      if (!searchTerm || typeof searchTerm !== "string" || searchTerm.trim().length < 1) {
        return res.status(400).json({ error: "Invalid search term" });
      }

      if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
        return res.status(400).json({ error: "Request body is empty or invalid" });
      }

      try {
        const redisData = JSON.stringify(body);
        await client.setex(cacheKey, 3600, redisData);
        return res.status(200).json(body);
      } catch (error) {
        console.error("Error saving data to Redis:", error);
        return res.status(500).json({ error: "Error saving data to Redis" });
      }
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error) {
    console.error("Redis error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// import type { VercelRequest, VercelResponse } from "@vercel/node";
// export default function handler(req: VercelRequest, res: VercelResponse) {
//   const { name = 'World' } = req.query
//   return res.json({
//     message: `Hello ${name}!`,
//   })
// }