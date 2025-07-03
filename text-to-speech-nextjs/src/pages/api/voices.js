import axios from 'axios';

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.status(200).json({ voices: response.data.voices });
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.error || error.message });
  }
}

