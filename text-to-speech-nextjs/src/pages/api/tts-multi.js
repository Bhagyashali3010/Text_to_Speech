// pages/api/tts-multi.js
import axios from 'axios';
import { Readable } from 'stream';
//import concat from 'concat-stream';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { inputText, inputType, languageCode, voiceName, pitch, rate } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const MAX_CHARS = 4500;
  const sentences = inputText.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g);
  if (!sentences) return res.status(400).json({ error: 'Invalid or empty input text' });

  let currentChunk = '';
  const audioBuffers = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    if ((currentChunk + sentence).length > MAX_CHARS) {
      await synthesizeChunk(currentChunk, audioBuffers);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk.trim()) await synthesizeChunk(currentChunk, audioBuffers);

  const combinedAudio = Buffer.concat(audioBuffers);
  const audioBase64 = combinedAudio.toString('base64');

  res.status(200).json({ audioContent: audioBase64 });

  async function synthesizeChunk(textChunk, audioBuffers) {
    const inputField = inputType === 'text' ? { text: textChunk } : { ssml: textChunk };

    const requestData = {
      input: inputField,
      voice: { languageCode, name: voiceName },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: rate
      }
    };

    if (pitch !== null && pitch !== undefined) requestData.audioConfig.pitch = pitch;

    try {
      const response = await axios.post(url, requestData);
      const audioContent = response.data.audioContent;
      const audioBuffer = Buffer.from(audioContent, 'base64');
      audioBuffers.push(audioBuffer);
    } catch (error) {
      console.error('TTS chunk error:', error.response?.data || error.message);
      throw error;
    }
  }
}
