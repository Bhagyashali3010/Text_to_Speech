import React, { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react"; // Add this at the top if not already present



export default function TranslatePage() {
  const [hindiText, setHindiText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [englishOnlyText, setEnglishOnlyText] = useState("");
  const [fileNameBoth, setFileNameBoth] = useState("translated_both");
  const [fileNameEnglish, setFileNameEnglish] = useState("translated_english");
  const router = useRouter();

  useEffect(() => {
  if (router.query.hindi) {
    setHindiText(decodeURIComponent(router.query.hindi));
  }
}, [router.query.hindi]);


  const handleTranslateBoth = async () => {
    const response = await fetch("http://localhost:8000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: hindiText,
    });




    const data = await response.json();
    if (data.english) {
      setTranslatedText(data.english);

      const englishLines = data.english
        .split("\n")
        .filter(line => /^[A-Za-z0-9\s.,'":;!?()\[\]{}\-]+$/.test(line.trim()))
        .join("\n");

      setEnglishOnlyText(englishLines);
    }
  };

  const handleDownload = (content, filename) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = '${filename}.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  const goToTranslateToLanguage = () => {
    router.push({
      pathname: "/translate-to-language",
      query: { text: encodeURIComponent(englishOnlyText) },
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Text Translator</h1>

      <textarea
        placeholder="Paste Hindi text here..."
        value={hindiText}
        onChange={(e) => setHindiText(e.target.value)}
        className="w-full max-w-2xl h-40 p-4 rounded bg-gray-800 mb-4 resize-y"
      />

      <button
        onClick={handleTranslateBoth}
        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold mb-8"
      >
        Translate to Hindi + English
      </button>

      {translatedText && (
        <div className="w-full max-w-3xl flex flex-col items-center space-y-10">
          {/* Hindi + English Output */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2">Hindi + English Output</h2>
            <textarea
              className="w-full p-4 rounded bg-gray-800 text-white h-60 resize-y"
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
            />
            <div className="mt-3 flex flex-col md:flex-row gap-2 items-start md:items-center">
              <input
                type="text"
                placeholder="Filename (no extension)"
                value={fileNameBoth}
                onChange={(e) => setFileNameBoth(e.target.value)}
                className="bg-gray-700 p-2 rounded text-white w-full md:w-64"
              />
              <button
                onClick={() => handleDownload(translatedText, fileNameBoth)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
              >
                Download Hindi+English
              </button>
              

            </div>
          </div>

          {/* English Only Output */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2">English Only Output</h2>
            <textarea
              className="w-full p-4 rounded bg-gray-800 text-white h-60 resize-y"
              value={englishOnlyText}
              onChange={(e) => setEnglishOnlyText(e.target.value)}
            />
            <div className="mt-3 flex flex-col md:flex-row gap-2 items-start md:items-center">
              <input
                type="text"
                placeholder="Filename (no extension)"
                value={fileNameEnglish}
                onChange={(e) => setFileNameEnglish(e.target.value)}
                className="bg-gray-700 p-2 rounded text-white w-full md:w-64"
              />
              <button
                onClick={() => handleDownload(englishOnlyText, fileNameEnglish)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold"
              >
                Download English Only
              </button>
              <button
                onClick={goToTranslateToLanguage}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white font-semibold mt-4"
              >
                Translate English Text to Other Language
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}