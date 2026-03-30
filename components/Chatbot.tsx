"use client";

import { useState } from "react";
import type { ChatMessage } from "@/types";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hi! Ask me anything about Astrologar reports ✨" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", text: data.reply || "..." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Sorry, I’m facing a network issue." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl p-4 w-full max-w-md bg-white shadow">
      <h3 className="font-semibold mb-2">Astrologar Assistant</h3>
      <div className="h-72 overflow-y-auto border rounded p-2 space-y-2 bg-slate-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`text-sm p-2 rounded ${
              m.role === "user" ? "bg-blue-100 ml-6" : "bg-white mr-6"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="border rounded px-3 py-2 text-sm flex-1"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white text-sm"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}