import express from 'express';
import redis from 'redis';
const router = express.Router();
const client = redis.createClient();
client.connect().then(() => {
  console.log('Connected to Redis');
});
router
  .route('/api/redis')
  .get(async (req, res) => {
    const { searchTerm } = req.query; 
    try {
      const exists = await client.exists(searchTerm);
      if (exists) {
        console.log(`Show ${searchTerm} from cache`);
        let result = await client.get(searchTerm);
        result = JSON.parse(result);
        return res.status(200).json(result);
      }
      return res.status(404).json({ error: `No cache found for ${searchTerm}` });
    } catch (error) {
      return res.status(500).json({ error: 'Error accessing Redis cache' });
    }
  })
  .post(async (req, res) => {
    const { searchTerm } = req.query; 
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 1) {
        throw 'Invalid search term';
      }
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    const redisData = req.body;
    if (!redisData || Object.keys(redisData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }
    try {
      await client.set(searchTerm, JSON.stringify(redisData), { EX: 3600 });
      return res.status(200).json(redisData);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: 'Error saving data to Redis' });
    }
  });

export default router;
