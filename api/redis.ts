/// <reference types="vite/types/importMeta.d.ts" />
import Redis from "ioredis";
const REDISURL = import.meta.env.VITE_REDIS_URL
const client = new Redis(REDISURL);

export default async function handler(req, res) {
    const { method, query: { searchTerm, searchValue }, body } = req;
    try {
        const cacheKey = `${searchValue}:${searchTerm}`;

        if (method === "GET") {
            try {
                const exists = await client.exists(cacheKey);
                if (exists) {
                    console.log(`Show ${cacheKey} from cache`);
                    let result = await client.get(cacheKey);
                    if (result) {
                        result = JSON.parse(result);
                    }
                    else {
                        return res.status(500).json({ error: 'Error accessing Redis cache' });
                    }
                    return res.status(200).json(result);
                }
                return res.status(404).json({ error: `No cache found for ${cacheKey}` });
            } catch (error) {
                return res.status(500).json({ error: 'Error accessing Redis cache' });
            }
        }

        if (method === "POST") {
            try {
                if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 1) {
                    throw 'Invalid search term';
                }
            } catch (e) {
                return res.status(400).json({ error: e });
            }
            const redisData = req.body;
            const redisSet = JSON.stringify(redisData)
            if (!redisData || Object.keys(redisData).length === 0) {
                return res
                    .status(400)
                    .json({ error: 'There are no fields in the request body' });
            }
            try {
                await client.setex(cacheKey, 3600, redisSet);
                return res.status(200).json(redisData);
            } catch (e) {
                return res.status(500).json({ error: 'Error saving data to Redis' });
            }
        }

        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${method} not allowed` });

    } catch (error) {
        console.error("Redis error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
