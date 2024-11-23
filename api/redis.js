const redis = require("redis");
const redisClient = redis.createClient();
redisClient.connect();

module.exports = async (req, res) => {
    const { method, query: { searchTerm, searchValue }, body } = req;

    try {
        if (method === "GET") {
            const cacheResult = await redisClient.get(`${searchValue}:${searchTerm}`);
            if (cacheResult) {
                return res.status(200).json(JSON.parse(cacheResult));
            }
            return res.status(404).json({ error: "Not found in cache" });
        } else if (method === "POST") {
            if (!searchTerm || !searchValue || !body || Object.keys(body).length === 0) {
                return res.status(400).json({ error: "Invalid input" });
            }
            await redisClient.setEx(`${searchValue}:${searchTerm}`, 3600, JSON.stringify(body));
            return res.status(200).json({ message: "Saved to Redis", data: body });
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({ error: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error("Redis error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
