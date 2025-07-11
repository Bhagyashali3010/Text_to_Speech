import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState('text');
  const [languageCode, setLanguageCode] = useState('en-US');
  const [voiceName, setVoiceName] = useState('');
  const [pitch, setPitch] = useState(0);
  const [rate, setRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState('');
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await axios.get(`/api/voices`);
        const allVoices = response.data.voices;
        const filteredVoices = allVoices.filter(voice => voice.languageCodes.includes(languageCode));
        setVoices(filteredVoices);
        if (filteredVoices.length) {
          setVoiceName(filteredVoices[0].name);
        } else {
          setVoiceName('');
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      }
    };
    fetchVoices();
  }, [languageCode]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target.result);
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      alert('Please upload a valid .txt file');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/tts-multi', {
        inputText,
        inputType,
        languageCode,
        voiceName,
        pitch,
        rate
      });
      const audioContent = response.data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Error: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 shadow rounded w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Text-to-Speech App</h1>

        <textarea
          rows="6"
          className="w-full border border-gray-600 p-2 mb-4 bg-gray-700 text-white"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text or SSML here or upload a text file"
        />

        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="mb-4 block text-white"
        />

        <div className="mb-4">
          <label className="mr-2">Input Type:</label>
          <select value={inputType} onChange={(e) => setInputType(e.target.value)} className="bg-gray-700 border-gray-600 text-white">
            <option value="text">Text</option>
            <option value="ssml">SSML</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mr-2">Language:</label>
          <select
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-IN">English (India)</option>
            <option value="es-ES">Spanish (Spain)</option>
            <option value="pt-PT">Portuguese (Portugal)</option>
            <option value="fr-FR">French (France)</option>
            <option value="de-DE">German (Germany)</option>
            <option value="hi-IN">Hindi (India)</option>
            <option value="it-IT">Italian (Italy)</option>
            <option value="ja-JP">Japanese</option>
            <option value="ko-KR">Korean</option>
            <option value="zh-CN">Chinese (Simplified)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mr-2">Voice:</label>
          <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="bg-gray-700 border-gray-600 text-white">
            {voices.map(voice => (
              <option key={voice.name} value={voice.name}>{voice.name} ({voice.ssmlGender})</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Pitch: {pitch}</label>
          <input type="range" min="-20" max="20" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full" />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Speaking Rate: {rate}</label>
          <input type="range" min="0.25" max="4" step="0.05" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full" />
        </div>

        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Convert to Speech</button>

        {audioUrl && (
          <div className="mt-6">
            <audio controls src={audioUrl} className="w-full"></audio>
            <a href={audioUrl} download="speech.mp3" className="block mt-2 text-blue-400 text-center">Download Audio</a>
          </div>
        )}
      </div>
    </div>
  );
}
