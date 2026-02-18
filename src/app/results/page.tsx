"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// import RefineChat from "../components/RefineChat";

export default function ResultsPage() {
  const [guestName, setGuestName] = useState("");
  const [result, setResult] = useState("");
  const [openaiResult, setOpenaiResult] = useState("");
  const [format, setFormat] = useState("");
  const [transcript, setTranscript] = useState("");
  const [activeTab, setActiveTab] = useState<"claude" | "chatgpt">("claude");
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedResult");
    if (!stored) {
      router.push("/");
      return;
    }
    const data = JSON.parse(stored);
    setGuestName(data.guestName || "Guest");
    setResult(data.result || "");
    setOpenaiResult(data.openaiResult || "");
    setFormat(data.format || "");
    setTranscript(data.transcript || "");
  }, [router]);

  const formatLabel: Record<string, string> = {
    learnings: "Learnings",
    qa: "Q&A",
    "making-post": "Making Post",
    "making-yt": "Making YT",
  };

  const title = `${formatLabel[format] || "Learnings"} from ${guestName}`;

  if (!result) return null;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full" style={{ backgroundColor: "#222222", paddingTop: "10px", paddingBottom: "10px" }}>
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={200}
              height={83}
              className="invert"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Sticky Back to Home */}
      <div className="sticky top-[calc(4rem+20px)] z-40 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 pt-4 pb-20">
        <h1 className="mb-8 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>

        {/* Tabs + Copy buttons */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1 rounded-xl bg-zinc-900 p-1">
            <button
              onClick={() => setActiveTab("claude")}
              className="rounded-lg px-5 py-2 text-sm font-medium transition-all"
              style={
                activeTab === "claude"
                  ? { backgroundColor: "#FF6900", color: "#fff" }
                  : { color: "#999" }
              }
            >
              Claude
            </button>
            <button
              onClick={() => setActiveTab("chatgpt")}
              className="rounded-lg px-5 py-2 text-sm font-medium transition-all"
              style={
                activeTab === "chatgpt"
                  ? { backgroundColor: "#FF6900", color: "#fff" }
                  : { color: "#999" }
              }
            >
              ChatGPT
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            >
              Copy Claude
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(openaiResult)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            >
              Copy ChatGPT
            </button>
          </div>
        </div>

        <article className="prose prose-zinc prose-lg max-w-none">
          {(activeTab === "claude" ? result : openaiResult).split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <br key={i} />;

            // Match numbered lines like "1." or "1)"
            const match = trimmed.match(/^(\d+)[.)]\s*(.*)/);
            if (match) {
              return (
                <p key={i} className="my-4">
                  <span className="mr-2 font-semibold text-zinc-400">
                    {match[1]}.
                  </span>
                  {match[2]}
                </p>
              );
            }

            return (
              <p key={i} className="my-4">
                {trimmed}
              </p>
            );
          })}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6">
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} The Gyaan Project. All rights
          reserved.
        </div>
      </footer>

      {/* Floating Refine Chat - hidden for now */}
      {/* <RefineChat
        transcript={transcript}
        currentOutput={result}
        onOutputUpdate={(newOutput) => setResult(newOutput)}
      /> */}
    </div>
  );
}
