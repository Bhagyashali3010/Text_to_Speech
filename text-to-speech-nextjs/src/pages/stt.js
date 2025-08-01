import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function SpeechToText() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState(""); // New state for filename
  const router = useRouter();

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
    setTranscribedText("");
  };

  const handleTranscription = async () => {
    if (!audioFile) return alert("Please upload an audio file!");

    const formData = new FormData();
    formData.append("audio", audioFile);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/transcribe-long", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.text) {
        setTranscribedText(res.data.text);
      } else {
        alert("Transcription failed");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      alert("An error occurred during transcription.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseForTranslation = () => {
    router.push(`/translate?hindi=${encodeURIComponent(transcribedText)}&from=stt`);
  };

  const handleDownload = () => {
    if (!filename.trim()) return alert("Please enter a filename.");

    const blob = new Blob([transcribedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.trim() + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Speech to Text</h1>

      <div>
        <label className="block font-semibold mb-1">Upload Audio File (.mp3 recommended):</label>
        <input
          type="file"
          accept="audio/*,.mpeg"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleTranscription}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
      >
        {loading ? "Transcribing..." : "Transcribe Audio"}
      </button>

      {transcribedText && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Transcribed Text (Editable):</label>
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              className="w-full h-40 p-3 border rounded resize-none"
              placeholder="Edit your transcribed text here..."
            />
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter filename (without .txt)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={handleDownload}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded w-full"
            >
              Download as File
            </button>
          </div>

          <button
            onClick={handleUseForTranslation}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded w-full"
          >
            Use for Translation
          </button>
        </div>
      )}
    </div>
  );
}
