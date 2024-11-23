const redis = require("redis");
const redisClient = redis.createClient();
redisClient.connect();

module.exports = async (req, res) => {
    const { method, query: { searchTerm, searchValue }, body } = req;

    try {
        const cacheKey = `${searchValue}:${searchTerm}`;
        if (method === "GET") {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
            return res.status(404).json({ error: "Not found in Redis" });
        } else if (method === "POST") {
            if (!body || !body.data) {
                return res.status(400).json({ error: "Invalid input data" });
            }
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(body.data)); // Cache expires after 1 hour
            return res.status(200).json({ message: "Saved to Redis", data: body.data });
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({ error: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error("Redis error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
