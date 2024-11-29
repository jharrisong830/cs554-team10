import express from 'express';
const router = express.Router();
import { config } from 'dotenv';
import Redis from "ioredis";
const REDISURL = import.meta.env.VITE_REDIS_URL
const client = new Redis(REDISURL);
config();

router
  .route('/api/redis')
  .get(async (req, res) => {
    const { searchTerm } = req.query; 
    const { searchValue } = req.query; 
    try {
      const exists = await client.exists(`${searchValue}:${searchTerm}`);
      if (exists) {
        console.log(`Show ${searchValue}:${searchTerm} from cache`);
        let result = await client.get(`${searchValue}:${searchTerm}`);
        result = JSON.parse(result);
        return res.status(200).json(result);
      }
      return res.status(404).json({ error: `No cache found for ${searchValue}:${searchTerm}`});
    } catch (error) {
      return res.status(500).json({ error: 'Error accessing Redis cache' });
    }
  })
  .post(async (req, res) => {
    const { searchTerm } = req.query; 
    const { searchValue } = req.query; 
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
      await client.setex(`${searchValue}:${searchTerm}`, 3600, redisSet);
      return res.status(200).json(redisData);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: 'Error saving data to Redis' });
    }
  });

export default router;
