"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar";

function parseSections(markdown: string) {
  const lines = markdown.split("\n");
  const sections: { title: string; content: string }[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  // If the output uses ## headings, parse from ##. If only # headings exist, parse from #.
  const hasMultiHash = lines.some(l => /^#{2,4}\s+/.test(l));
  const headingRegex = hasMultiHash ? /^#{2,4}\s+(.+)/ : /^#{1,4}\s+(.+)/;

  for (const line of lines) {
    const headingMatch = line.match(headingRegex);
    if (headingMatch) {
      if (currentTitle || currentContent.join("").trim()) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = headingMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle || currentContent.join("").trim()) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }

  return sections;
}

function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 text-[#cb5400] hover:text-[#a34300] transition-colors"
      title="Copy"
    >
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function CopyLabelButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ModelSection({
  content,
  label,
  defaultExpanded,
}: {
  content: string;
  label: string;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const sections = parseSections(content);

  return (
    <div className="border-b border-zinc-200">
      {/* Accordion header */}
      <div className="flex items-center justify-between py-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 text-2xl font-bold text-zinc-900"
        >
          <span className="text-base">{expanded ? "▼" : "▶"}</span>
          <span>{label}</span>
        </button>
        <CopyLabelButton text={content} />
      </div>

      {expanded && (
        <div className="pl-8 pb-12">
          {sections.map((section, i) => (
            <div key={i}>
              {i > 0 && <hr className="border-zinc-400 my-8" />}

              {/* Section label + copy icon */}
              {section.title && (
                <div className="flex items-start justify-between gap-6 mb-4">
                  <span className="text-[36px] font-bold leading-tight text-zinc-900">
                    {section.title.charAt(0).toUpperCase() + section.title.slice(1).toLowerCase()}
                  </span>
                  <CopyIconButton text={section.content} />
                </div>
              )}

              {/* Content — Major Third scale (×1.25): p=17 → h3=21 → h2=27 → h1=33 */}
              <div className="
                [&_p]:text-[17px] [&_p]:leading-[1.75] [&_p]:text-zinc-800 [&_p]:mt-0 [&_p]:mb-[1.1em]
                [&_h1]:text-[33px] [&_h1]:leading-[1.2] [&_h1]:font-bold [&_h1]:tracking-[-0.02em] [&_h1]:text-zinc-900 [&_h1]:mt-0 [&_h1]:mb-4
                [&_h2]:text-[27px] [&_h2]:leading-[1.3] [&_h2]:font-bold [&_h2]:tracking-[-0.015em] [&_h2]:text-zinc-900 [&_h2]:mt-0 [&_h2]:mb-3
                [&_h3]:text-[21px] [&_h3]:leading-[1.4] [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_h3]:mt-0 [&_h3]:mb-3
                [&_h4]:text-[17px] [&_h4]:leading-[1.6] [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_h4]:mt-0 [&_h4]:mb-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
                [&_li]:text-[17px] [&_li]:leading-[1.75] [&_li]:text-zinc-800 [&_li]:mb-3
                [&_strong]:font-semibold [&_strong]:text-zinc-900
                [&_li_strong]:!font-normal [&_li_strong]:!text-zinc-800
                [&_em]:italic [&_em]:text-zinc-600
                [&_a]:text-[#cb5400] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline
                [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-500 [&_blockquote]:my-5
              ">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const [result, setResult] = useState("");
  const [openaiResult, setOpenaiResult] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedResult");
    if (!stored) {
      router.push("/");
      return;
    }
    const data = JSON.parse(stored);
    setResult(data.result || "");
    setOpenaiResult(data.openaiResult || "");
  }, [router]);

  if (!result) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-[96px] pb-20">
        <ModelSection content={result} label="Claude" defaultExpanded={false} />
        {openaiResult && (
          <ModelSection content={openaiResult} label="ChatGPT" defaultExpanded={false} />
        )}
      </main>
      <footer className="border-t border-zinc-200 py-6">
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-zinc-400">
          &copy; {new Date().getFullYear()} The Gyaan Project. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
