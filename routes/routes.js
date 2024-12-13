import express from 'express';
const router = express.Router();
import { config } from 'dotenv';
import Redis from "ioredis";
config();
const REDISURL = process.env.REDIS_URL;
const client = new Redis(REDISURL);

router
  .route('/api/redis')
  .get(async (req, res) => {
    const { method, query: { searchTerm, searchValue }, body } = req;
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
    const { method, query: { searchTerm, searchValue }, body } = req;
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


router
  .route('/api/process-image')
  .get(async (req, res) => {
    try {
      const { image } = req.body;
      const buffer = Buffer.from(image, "base64");

      // Process the image using ImageMagick
      const processedImageBuffer = im.convert({
        srcData: buffer,          // Input base64 image buffer
        width: 800,               // Resize the image width to 800px
        quality: 80,              // Set the image quality to 80
        format: "jpg",            // Output image format as JPEG
      });

      const base64Image = processedImageBuffer.toString("base64"); 
      res.status(200).json({ image: base64Image }); 

    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred." });
      }
    }
  });
export default router;
