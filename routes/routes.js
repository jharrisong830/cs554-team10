import express from 'express';
const router = express.Router();
import { config } from 'dotenv';
import Redis from "ioredis";
import * as im from "imagemagick";
import fs from "fs";
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
      return res.status(404).json({ error: `No cache found for ${searchValue}:${searchTerm}` });
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
  .post("/api/process-image", async (req, res) => {
    try {
      const { image, caption } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Image is required." });
      }

      const buffer = Buffer.from(image, "base64");
      const tempInputFile = "/tmp/input.png";
      const tempOutputFile = "/tmp/output.png";
      await fs.promises.writeFile(tempInputFile, buffer);

      const captionOptions = [
        "-font", "Spotify",
        "-pointsize", "48",
        "-fill", "white",
        "-stroke", "black",
        "-strokewidth", "2",
        "-gravity", "south",
        "-annotate", "+0+20", caption,
      ];

      im.convert(
        [
          tempInputFile,
          ...captionOptions,
          "-resize", "1080x",
          "-quality", "100",
          tempOutputFile,
        ],
        async (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error processing image." });
          }
          const processedBuffer = await fs.promises.readFile(tempOutputFile);
          const base64Image = processedBuffer.toString("base64");
          await Promise.all([
            fs.promises.unlink(tempInputFile),
            fs.promises.unlink(tempOutputFile),
          ]);

          res.status(200).json({ image: base64Image });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
export default router;
