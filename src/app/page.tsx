import Navbar from "./components/Navbar";
import FileUpload from "./components/FileUpload";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <div className="mb-4 inline-block rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          Powered by Claude
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Jo hukum{" "}
          <span className="animate-gradient bg-[length:300%_300%] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #FF6900, #FF4400, #FF6900, #FF4400, #FF6900)" }}>
            mere aaka
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Upload your podcast transcript and instantly generate blog posts,
          social media content, newsletters, and more.
        </p>
        <FileUpload />
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} The Gyaan Project. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
