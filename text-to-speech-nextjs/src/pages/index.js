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
      const response = await axios.post('/api/tts', {
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
          <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} className="bg-gray-700 border-gray-600 text-white">
            <option value="en-US">English (US)</option>
            <option value="hi-IN">Hindi (IN)</option>
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
          <input type="range" min="0.25" max="2" step="0.05" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full" />
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


/*import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [inputType, setInputType] = useState("text");
  const [languageCode, setLanguageCode] = useState("en-US");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [pitch, setPitch] = useState(0);
  const [rate, setRate] = useState(1);
  const [audioSrc, setAudioSrc] = useState("");

  useEffect(() => {
    axios.get("/api/voices").then((res) => {
      const filtered = res.data.filter((v) =>
        v.languageCodes.includes(languageCode)
      );
      setVoices(filtered);
      setVoiceName(filtered[0]?.name || "");
    });
  }, [languageCode]);

  const synthesizeSpeech = async () => {
    if (!textInput) return alert("Enter text or SSML!");

    const response = await axios.post("/api/tts", {
      inputText: textInput,
      inputType,
      languageCode,
      voiceName,
      pitch,
      rate,
    });

    if (response.data.audioContent) {
      setAudioSrc(`data:audio/mp3;base64,${response.data.audioContent}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Text to Speech App</h1>

      <div className="flex items-center gap-3">
        <span>Input Mode:</span>
        <button
          onClick={() => setInputType("text")}
          className={`px-3 py-1 rounded ${inputType === "text" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Text
        </button>
        <button
          onClick={() => setInputType("ssml")}
          className={`px-3 py-1 rounded ${inputType === "ssml" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          SSML
        </button>
      </div>

      <textarea
        className="w-full h-36 p-3 border rounded"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Enter your text or SSML here..."
      />

      <div>
        <label className="block mb-1 font-semibold">Select Language:</label>
        <select
          className="w-full p-2 border rounded"
          value={languageCode}
          onChange={(e) => setLanguageCode(e.target.value)}
        >
          <option value="en-US">English (US)</option>
          <option value="hi-IN">Hindi (India)</option>
          <option value="en-IN">English (India)</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Select Voice:</label>
        <select
          className="w-full p-2 border rounded"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.ssmlGender})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Pitch: {pitch}</label>
        <input
          type="range"
          min="-20"
          max="20"
          step="1"
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Speaking Rate: {rate}</label>
        <input
          type="range"
          min="0.25"
          max="4.0"
          step="0.05"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={synthesizeSpeech}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Convert to Speech
      </button>

      {audioSrc && (
        <audio controls className="w-full mt-4">
          <source src={audioSrc} type="audio/mp3" />
        </audio>
      )}
    </div>
  );
}*/
