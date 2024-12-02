import sharp from 'sharp';
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { image } = req.body;
      const buffer = Buffer.from(image, "base64");
      const processedImage = await sharp(buffer)
        .resize(800) // Resize width to 800px
        .jpeg({ quality: 80 }) // Convert to JPEG with quality 80
        .toBuffer();

      const base64Image = processedImage.toString('base64');
      res.status(200).json({ image: base64Image });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred." });
      }
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
