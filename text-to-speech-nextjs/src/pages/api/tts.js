import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { inputText, inputType, languageCode, voiceName, pitch, rate } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const inputField = inputType === 'text' ? { text: inputText } : { ssml: inputText };

  const requestData = {
    input: inputField,
    voice: {
      languageCode,
      name: voiceName
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: rate,
      pitch: pitch
    }
  };

  try {
    const response = await axios.post(url, requestData);
    const audioContent = response.data.audioContent;
    res.status(200).json({ audioContent });
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.error || error.message });
  }
}
