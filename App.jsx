/* Gujarati Voice → Comedy Text Converter Single-file React component (App) ready to preview in a Vite or Create React App project.

How to run (quick):

1. npm create vite@latest gv2c -- --template react


2. cd gv2c && npm install


3. Replace src/App.jsx with this file's contents


4. Ensure TailwindCSS is installed (optional but recommended) or use the fallback styles below

Tailwind quick: https://tailwindcss.com/docs/guides/vite



5. npm run dev



Notes:

Uses the Web Speech API (SpeechRecognition) for live Gujarati speech -> text when supported (language set to 'gu-IN').

If browser doesn't support SpeechRecognition, there's a local text input + file upload fallback.

Comedy conversion is done locally with a lightweight rule-based transformer + templates tailored to Gujarati humor.

There's an example server endpoint placeholder (/api/llm) for optional LLM-based polishing if you want to plug OpenAI/Hugging Face later. You'll need your own API key for that.

Do NOT paste real API keys into public code. Use .env and server-side secrets. */


import React, { useEffect, useRef, useState } from "react"; import { FiMic, FiUpload, FiPlay, FiCopy } from "react-icons/fi";

export default function App() { const [listening, setListening] = useState(false); const [transcript, setTranscript] = useState(""); const [comedyText, setComedyText] = useState(""); const recognitionRef = useRef(null); const [supported, setSupported] = useState(true); const [audioUrl, setAudioUrl] = useState(null); const fileInputRef = useRef(null);

useEffect(() => { // Initialize Web Speech API (if available) const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SpeechRecognition) { setSupported(false); return; } const recog = new SpeechRecognition(); recog.lang = "gu-IN"; // Gujarati (India) recog.interimResults = true; recog.continuous = true;

recog.onresult = (event) => {
  let interim = "";
  let final = "";
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const res = event.results[i];
    if (res.isFinal) final += res[0].transcript;
    else interim += res[0].transcript;
  }
  // show both final + interim for live feel
  setTranscript((prev) => (final ? prev + final : prev));
  // We also update with interim so user sees live text
  if (interim) setTranscript((prev) => prev + interim);
};

recog.onerror = (e) => {
  console.error("SpeechRecognition error:", e);
};

recognitionRef.current = recog;

}, []);

const toggleListen = () => { if (!recognitionRef.current) return; if (listening) { recognitionRef.current.stop(); setListening(false); } else { setTranscript(""); recognitionRef.current.start(); setListening(true); } };

// Simple Gujarati comedy transformer (local, rule-based) function transformToComedy(plainText) { if (!plainText || plainText.trim().length === 0) return "";

// Normalize
let t = plainText.trim();

// Shorten long sentences, add exaggeration
const templates = [
  (s) => ${s} 😆 અને પછી લોકો કહે જુએ છે, 'આનો તોaction જલ્દી માંલાવ!',
  (s) => સાચું કહો તો ${s} — અને હા, મારે પણ વાઇફ/પોલીસ/મિત્રને સમજાવવું પડે છે.,
  (s) => ${s} 🤏 (સાવધ રહેવું — હાસ્ય બચાવેલું છે),
  (s) => આ રીતે: ${s} 😜 — છેલ્લે તો હું પણ હસીને પડ્યો ગયો!,
];

// Add playful exaggerations / Gujarati idioms commonly used for comedy
const idioms = ["વાઘનો નૃત્ય", "ચોખાના ગોળા", "મોજમાં રહી ને કામે ભંગ"].sort(() => Math.random() - 0.5);

// break the text into sentences
const parts = t.split(/[\.\?\!\n]+/).filter(Boolean);
const out = parts
  .map((p, idx) => {
    p = p.trim();
    if (p.length < 15) {
      // short punchy line
      const pick = templates[idx % templates.length];
      return pick(p);
    }
    // otherwise inject an idiom and a playful aside
    const idiom = idioms[idx % idioms.length];
    return ${p} — અને હા, ${idiom} તો બની જ ગયો.;
  })
  .join("\n\n");

// small randomized puns using Gujarati words
const puns = ["બટાકા નહી, આજ બટાકું જ જોમાય છે", "હવે તો jokes પણ અપડેટ થઈ ગયા"].sort(() => Math.random() - 0.5);
return out + "\n\n" + puns[0];

}

const handleConvert = async () => { // First do local transformation const local = transformToComedy(transcript); setComedyText(local);

// Optional: if user has a server-side LLM, they can POST to /api/llm to polish it
// This is a placeholder showing how you'd call it. It won't work unless you implement server.
try {
  const resp = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: local }),
  });
  if (resp.ok) {
    const data = await resp.json();
    if (data?.comedy) setComedyText(data.comedy);
  }
} catch (e) {
  // ignore network errors — local transform still present
  // console.warn("LLM polish skipped:", e);
}

};

const handleUpload = (e) => { const file = e.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); setAudioUrl(url); // NOTE: browser can't transcribe local audio without server; prompt user to play + speak or use manual input };

const handleCopy = async (text) => { try { await navigator.clipboard.writeText(text); alert("Copied to clipboard!"); } catch (e) { alert("Copy failed — please select & copy manually."); } };

const clearAll = () => { setTranscript(""); setComedyText(""); setAudioUrl(null); };

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 p-6"> <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Left: visual + controls /} <div className="flex flex-col gap-4"> <div className="rounded-xl overflow-hidden flex items-center justify-center aspect-video bg-gradient-to-r from-purple-300 to-pink-200"> {/ Decorative animated background */} <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="none"> <defs> <linearGradient id="g1" x1="0" x2="1"> <stop offset="0%" stopColor="#ff9a9e" /> <stop offset="50%" stopColor="#fad0c4" /> <stop offset="100%" stopColor="#fad0c4" /> </linearGradient> </defs> <rect width="600" height="400" fill="url(#g1)" /> <g opacity="0.12"> <circle cx="520" cy="60" r="100" fill="#fff" /> <circle cx="60" cy="340" r="140" fill="#fff" /> </g> <text x="30" y="50" fontSize="28" fill="#ffffff" fontWeight="700">Gujarati Voice → Comedy</text> </svg> </div>

<div className="flex gap-2">
        <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg shadow" onClick={toggleListen}>
          <FiMic /> {listening ? "Stop Listening" : "Start Listening"}
        </button>

        <label className="btn-outline flex items-center gap-2 px-4 py-2 rounded-lg shadow cursor-pointer">
          <FiUpload />
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          Upload Audio
        </label>

        <button className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg" onClick={clearAll}>
          Clear
        </button>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        {supported ? (
          <div>Microphone live transcript shown below. Use Gujarati speech (gu-IN).</div>
        ) : (
          <div>SpeechRecognition not supported in this browser. Use manual input or upload audio.</div>
        )}
      </div>

      <div className="mt-4 bg-slate-50 rounded-lg p-3 h-40 overflow-auto">
        <h4 className="font-semibold">Live Transcript</h4>
        <p className="whitespace-pre-wrap">{transcript || <em>No transcript yet — speak or paste text.</em>}</p>
      </div>

      <div className="flex gap-2 mt-2">
        <button className="btn-primary" onClick={handleConvert}>
          Make it Funny 🤡
        </button>

        <button
          className="btn-light"
          onClick={() => {
            // quick client-side polish (re-run transformer with current comedyText as input for slight variations)
            setComedyText((c) => transformToComedy(c || transcript));
          }}
        >
          Remix Joke
        </button>

        <button
          className="btn-outline"
          onClick={() => handleCopy(comedyText || transcript)}
        >
          <FiCopy /> Copy
        </button>
      </div>
    </div>

    {/* Right: output */}
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Comedy Output</h3>
        <div className="text-sm text-slate-500">Preview & edit before sharing</div>
      </div>

      <textarea
        value={comedyText}
        onChange={(e) => setComedyText(e.target.value)}
        className="flex-1 p-4 rounded-lg border resize-none h-64"
        placeholder="Your comedy text will appear here..."
      />

      <div className="flex items-center gap-3">
        {audioUrl && (
          <audio controls src={audioUrl} className="mr-2" />
        )}

        <button
          onClick={() => {
            // simple pronunciation: use SpeechSynthesis if available
            if (!window.speechSynthesis) return alert("TTS not supported in this browser.");
            const utter = new SpeechSynthesisUtterance(comedyText || transcript || "અહીં લખાણ બતાવવામાં આવશે");
            utter.lang = "gu-IN";
            window.speechSynthesis.speak(utter);
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <FiPlay /> Play TTS
        </button>

        <button
          onClick={() => handleCopy(comedyText || transcript)}
          className="btn-outline px-4 py-2 rounded-lg"
        >
          Copy Text
        </button>

        <a
          href={data:text/plain;charset=utf-8,${encodeURIComponent(comedyText || transcript)}}
          download={gujarati_comedy_${Date.now()}.txt}
          className="btn-ghost px-4 py-2 rounded-lg"
        >
          Download
        </a>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Pro tip: For funnier results, speak conversationally, add a short story, and include a recognizable Gujarati setting (દિવાળીઘર, શેરી ના રસ્તા, શાળા). The transformer will add punchlines and idioms.
      </div>
    </div>
  </div>

  {/* Tailwind-like minimal styles fallback if Tailwind not installed */}
  <style>{`
    .btn-primary{ background: linear-gradient(90deg,#7c3aed,#ec4899); color:white; }
    .btn-outline{ border:1px solid #e5e7eb; background:white; }
    .btn-ghost{ background:transparent; }
    .btn-light{ background: #f3f4f6; }
    .btn-primary, .btn-outline, .btn-ghost, .btn-light{ display:inline-flex; align-items:center; justify-content:center; }
  `}</style>
</div>

); }
