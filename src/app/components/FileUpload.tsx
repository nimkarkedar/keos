"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const ACCEPTED_TYPES = [".txt", ".srt", ".vtt", ".doc", ".docx", ".pdf"];

const LOADING_WORDS = [
  "Crunching",
  "Thinking",
  "Generating",
  "Mulling",
  "Dancing",
  "Singing",
  "Brewing",
  "Pondering",
  "Vibing",
  "Scribbling",
  "Dreaming",
  "Doodling",
  "Cooking",
  "Stirring",
  "Juggling",
  "Brainstorming",
  "Manifesting",
  "Scheming",
  "Conjuring",
  "Simmering",
  "Whispering",
  "Channeling",
  "Absorbing",
  "Percolating",
  "Noodling",
  "Marinating",
  "Decoding",
  "Unraveling",
  "Composing",
  "Crafting",
  "Distilling",
  "Hatching",
  "Meditating",
  "Remixing",
  "Shuffling",
  "Sparkling",
  "Stretching",
  "Summoning",
  "Tinkering",
  "Waltzing",
  "Wondering",
  "Caffeinating",
  "Philosophizing",
  "Daydreaming",
  "Freestyle-ing",
  "Jazz-handing",
  "Moonwalking",
  "Soul-searching",
  "Plot-twisting",
  "Mind-melding",
];

const OUTPUT_OPTIONS = [
  { value: "learnings", label: "Learnings", hint: "Get clear takeaways from the uploaded file" },
  { value: "qa", label: "Q&A", hint: "Get everything from the attached file in form of Q&A" },
  // { value: "making-post", label: "Making Post", hint: "" },
  // { value: "making-yt", label: "Making YT", hint: "" },
];

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [loadingWord, setLoadingWord] = useState(LOADING_WORDS[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_WORDS.length;
      setLoadingWord(LOADING_WORDS[i]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const extractPdfText = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to parse PDF");
    }

    return data.text;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setFileContent(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(
        `Unsupported file type. Please upload: ${ACCEPTED_TYPES.join(", ")}`
      );
      return;
    }
    setFileName(file.name);

    try {
      if (ext === ".pdf") {
        setIsProcessingFile(true);
        const text = await extractPdfText(file);
        setFileContent(text);
        setIsProcessingFile(false);
      } else {
        const text = await file.text();
        setFileContent(text);
      }
    } catch (err) {
      console.error("File read error:", err);
      setIsProcessingFile(false);
      setError("Failed to read the file. Please try a .txt file instead.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!fileName || !fileContent) {
      setError("Please upload a transcript file first.");
      return;
    }
    if (!selectedOutput) {
      setError("Please select an output format.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: fileContent,
          format: selectedOutput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("rate_limit")) {
          setError("The transcript is too large or you're sending too many requests. Please wait a moment and try again.");
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      sessionStorage.setItem(
        "generatedResult",
        JSON.stringify({
          guestName: data.guestName,
          result: data.result,
          format: selectedOutput,
          transcript: fileContent,
        })
      );
      router.push("/results");
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
            : fileName
              ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/20"
              : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        {isProcessingFile ? (
          <>
            <div className="mb-2 text-4xl animate-pulse">📄</div>
            <p className="text-base font-medium">Processing PDF...</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Extracting text from {fileName}
            </p>
          </>
        ) : fileName && fileContent ? (
          <>
            <div className="mb-2 text-4xl">✅</div>
            <p className="text-base font-medium">{fileName}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Click or drop another file to replace
            </p>
          </>
        ) : (
          <>
            <div className="mb-3 text-4xl">📄</div>
            <p className="text-base font-medium">
              Drop your transcript file here
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              or click to browse
            </p>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              Supports: {ACCEPTED_TYPES.join(", ")}
            </p>
          </>
        )}
      </div>

      {/* Dropdown + Submit */}
      <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
        <select
          value={selectedOutput}
          onChange={(e) => {
            setSelectedOutput(e.target.value);
            setError(null);
          }}
          className="h-12 w-full appearance-none rounded-xl border border-zinc-300 bg-white pr-10 pl-5 text-sm font-medium leading-none text-zinc-900 outline-none transition-colors hover:border-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-orange-500 sm:w-64"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            backgroundSize: "16px",
          }}
        >
          <option value="" disabled>
            Select output format...
          </option>
          {OUTPUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`h-12 w-full rounded-xl px-8 text-sm font-medium leading-none transition-all sm:w-auto ${
            isLoading
              ? "min-w-[180px] text-white"
              : "text-white hover:opacity-90"
          } disabled:cursor-not-allowed`}
          style={{
            backgroundColor: isLoading ? undefined : "#FF6900",
            backgroundImage: isLoading
              ? "linear-gradient(90deg, #FF6900, #FF4400, #FF6900)"
              : undefined,
            backgroundSize: isLoading ? "300% 300%" : undefined,
            animation: isLoading ? "gradient 4s ease infinite" : undefined,
          }}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="inline-block w-[100px] text-left transition-all">
                {loadingWord}...
              </span>
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {selectedOutput && OUTPUT_OPTIONS.find((o) => o.value === selectedOutput)?.hint && (
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {OUTPUT_OPTIONS.find((o) => o.value === selectedOutput)?.hint}
        </p>
      )}

      {error && (
        <p className="mt-3 text-center text-sm text-red-500">{error}</p>
      )}

    </div>
  );
}
