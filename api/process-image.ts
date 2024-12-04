import { VercelRequest, VercelResponse } from "@vercel/node";
import * as im from "imagemagick";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
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
  } else {
    res.status(405).send("Method not allowed");
  }
}
