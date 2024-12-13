import { VercelRequest, VercelResponse } from "@vercel/node";
import sharp from "sharp";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required." });
      }
      const buffer = Buffer.from(image, "base64");
      const processedImageBuffer = await sharp(buffer)
        .resize({ width: 1080 })
        .png({ quality: 100 })
        .toBuffer();
      const base64Image = processedImageBuffer.toString("base64");
      res.status(200).json({ image: base64Image });
    } catch (error) {
      console.error("Error processing image:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred." });
      }
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}