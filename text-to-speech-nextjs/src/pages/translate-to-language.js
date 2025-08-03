// pages/translate-to-language.js

import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/router";



export default function TranslateToLanguage() {
  const [englishText, setEnglishText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initialText = router.query.text ? decodeURIComponent(router.query.text) : "";
    setEnglishText(initialText);
  }, [router.query.text]);
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([translatedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);

    const language = selectedLanguage || "translated";
    element.download = `translation-${language.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
 };

  const handleTranslate = async () => {
    if (!englishText || !selectedLanguage) {
      alert("Please enter English text and select a language.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/translate-to-language", {
        english_text: englishText,
        target_language: selectedLanguage,
      });

      if (res.data.translated_text) {
        setTranslatedText(res.data.translated_text);
      } else {
        alert("Translation failed.");
      }
    } catch (err) {
      console.error("Translation error:", err);
      alert("An error occurred while translating.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Translate English to Other Language</h1>

      <div>
        <label className="block font-semibold mb-1">Enter English Text:</label>
        <textarea
          className="w-full border p-3 rounded h-40"
          value={englishText}
          onChange={(e) => setEnglishText(e.target.value)}
          placeholder="Enter text in English..."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Select Language:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="">-- Select Language --</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="portuguese">Portuguese</option>
          <option value="german">German</option>
          <option value="japanese">Japanese</option>
          <option value="polish">Polish</option>
          {/* Add more languages here if needed */}
        </select>
      </div>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div className="mt-4">
          <label className="block font-semibold mb-1">Translated Text:</label>
          <textarea
            readOnly
            className="w-full border p-3 rounded h-40 bg-gray-100 text-black"
            value={translatedText}
          />
          <button
            onClick={handleDownload}
            className="mt-4 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
          >
            Download Translated Text
          </button>
        </div>
      )}
    </div>
  );
}
