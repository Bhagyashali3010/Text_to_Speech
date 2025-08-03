// pages/api/transcribe.js
import { SpeechClient } from "@google-cloud/speech";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

const client = new SpeechClient({
  keyFilename: "tgf-text-to-speech-645150b5f66b.json", // Replace with actual JSON filename
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "File parsing failed." });
    }

    if (!files.audio || !files.audio.filepath) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    const filePath = files.audio.filepath;
    const audioBytes = fs.readFileSync(filePath).toString("base64");

    const audio = {
      content: audioBytes,
    };

    const config = {
      encoding: "MP3",
      languageCode: "hi-IN", // Change based on language
    };

    const request = {
      audio,
      config,
    };

    try {
      const [response] = await client.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join(" ");
      res.status(200).json({ text: transcription });
    } catch (error) {
      console.error("STT Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
