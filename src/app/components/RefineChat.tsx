"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RefineChatProps {
  transcript: string;
  currentOutput: string;
  onOutputUpdate: (newOutput: string) => void;
}

export default function RefineChat({
  transcript,
  currentOutput,
  onOutputUpdate,
}: RefineChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const handleSend = async () => {
    const feedback = input.trim();
    if (!feedback || isLoading) return;

    setInput("");
    setError(null);
    if (inputRef.current) inputRef.current.style.height = "auto";

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: feedback },
    ];
    setChatHistory(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          currentOutput,
          feedback,
          chatHistory: chatHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setChatHistory([
        ...newHistory,
        { role: "assistant", content: "Done! I've updated the output based on your feedback." },
      ]);
      onOutputUpdate(data.result);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#FF6900" }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "80vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl px-6 py-4" style={{ backgroundColor: "#222222" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "#FF6900" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Refine Output</p>
                  <p className="text-xs text-zinc-400">Suggest changes, give context, iterate</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: "200px" }}>
              {chatHistory.length === 0 && !isLoading && (
                <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="mb-2 text-sm font-medium text-zinc-500">How can I improve this?</p>
                  <p className="max-w-sm text-xs leading-relaxed text-zinc-400">
                    Try things like &quot;Make it more conversational&quot;, &quot;Add more punchy one-liners&quot;,
                    &quot;Point 5 is wrong — the guest said...&quot;, or &quot;Reduce to 15 points&quot;
                  </p>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div key={i} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-zinc-900 text-white"
                        : "rounded-bl-md border border-zinc-100 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: "#FF6900" }} />
                        {msg.content}
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" style={{ animationDelay: "0.2s" }} />
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" style={{ animationDelay: "0.4s" }} />
                      <span className="ml-2">Refining your content...</span>
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <p className="mb-3 text-center text-xs text-red-500">{error}</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-100 px-6 py-4">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me what to change..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-30"
                  style={{ backgroundColor: "#FF6900" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94l18-8.25a.75.75 0 000-1.38l-18-8.25z" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-zinc-400">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
