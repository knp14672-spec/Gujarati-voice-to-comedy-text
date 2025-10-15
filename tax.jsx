/* Gujarati Voice + Typing → Comedy Text Converter */

import React, { useEffect, useRef, useState } from "react";
import { FiMic, FiPlay, FiCopy } from "react-icons/fi";

export default function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [comedyText, setComedyText] = useState("");
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(true);

  // Initialize microphone (Gujarati Speech to Text)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "gu-IN";
    recog.interimResults = true;
    recog.continuous = true;

    recog.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscript((prev) => prev + final + interim);
    };
    recognitionRef.current = recog;
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Comedy Text Transformer
  function transformToComedy(text) {
    if (!text.trim()) return "";
    const idioms = ["વાઘનો નૃત્ય", "ચોખાના ગોળા", "મોજમાં રહી ને કામે ભંગ"].sort(
      () => Math.random() - 0.5
    );
    const templates = [
      (s) => ${s} 😆 અને પછી લોકો કહે જુએ છે, 'આનો તોaction જલ્દી માંલાવ!',
      (s) =>
        સાચું કહો તો ${s} — અને હા, મારે પણ વાઇફ/પોલીસ/મિત્રને સમજાવવું પડે છે.,
      (s) => ${s} 🤏 (સાવધ રહેવું — હાસ્ય બચાવેલું છે),
      (s) => આ રીતે: ${s} 😜 — છેલ્લે તો હું પણ હસીને પડ્યો ગયો!,
    ];

    const parts = text.split(/[\\.\\?\\!\\n]+/).filter(Boolean);
    const out = parts
      .map((p, i) => {
        p = p.trim();
        if (p.length < 15) {
          return templates[i % templates.length](p);
        }
        return ${p} — અને ${idioms[i % idioms.length]} તો બની જ ગયો.;
      })
      .join("\n\n");
    return out + "\n\n😂 હવે તો joke પણ update થઈ ગયા!";
  }

  // 🔥 Auto comedy when typing
  useEffect(() => {
    if (transcript.trim()) {
      const funny = transformToComedy(transcript);
      setComedyText(funny);
    } else {
      setComedyText("");
    }
  }, [transcript]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100 p-6">
      <div className="max-w-3xl w-full bg-white/80 rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Gujarati Voice + Typing → Comedy Text 😂
        </h1>

        <div className="flex gap-3 mb-3 justify-center">
          <button
            onClick={toggleListen}
            className="px-4 py-2 rounded-lg shadow bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-2"
          >
            <FiMic />
            {listening ? "Stop Listening" : "Start Listening"}
          </button>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full h-32 border rounded-lg p-3 text-gray-700"
          placeholder="અહીં બોલો અથવા લખો — તમારું લખાણ ફની બનશે!"
        ></textarea>

        <h3 className="text-lg font-semibold mt-4">🎭 Comedy Output:</h3>
        <textarea
          readOnly
          value={comedyText}
          className="w-full h-40 border rounded-lg p-3 bg-yellow-50 text-gray-800"
        ></textarea>

        <div className="flex justify-between mt-3">
          <button
            onClick={() => {
              if (!window.speechSynthesis)
                return alert("TTS not supported in this browser.");
              const utter = new SpeechSynthesisUtterance(comedyText);
              utter.lang = "gu-IN";
              window.speechSynthesis.speak(utter);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
          >
            <FiPlay /> બોલી બતાવ
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(comedyText);
              alert("Copied to clipboard!");
            }}
            className="px-4 py-2 border rounded-lg flex items-center gap-2"
          >
            <FiCopy /> Copy
          </button>
        </div>
      </div>
    </div>
  );
}
