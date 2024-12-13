import { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageMagick } from "@imagemagick/magick-wasm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required." });
      }

      const buffer = Buffer.from(image, "base64");

      let outputBuffer: Uint8Array | undefined;

      // Process the image with ImageMagick
      ImageMagick.read(buffer, (img) => {
        img.resize(800, 0); // Resize to width 800px while maintaining aspect ratio
        img.write((data) => {
          outputBuffer = data;
        });
      });

      if (!outputBuffer) {
        throw new Error("Failed to process image");
      }

      const base64Image = Buffer.from(outputBuffer).toString("base64");
      res.status(200).json({ image: base64Image });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}
