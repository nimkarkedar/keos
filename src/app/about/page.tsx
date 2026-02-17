import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full" style={{ backgroundColor: "#222222", paddingTop: "10px", paddingBottom: "10px" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-10">
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
          <Link
            href="/about"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            About
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl flex-1 px-6 pt-32 pb-20">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          About
        </h1>

        <div className="space-y-6 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            <strong>KEOS</strong> is a tool built by{" "}
            <strong>Kedar Nimkar</strong>, host and creator of{" "}
            <strong>The Gyaan Project (TGP)</strong> — a podcast and YouTube
            channel dedicated to exploring creative wisdom.
          </p>

          <p>
            Since 2016, The Gyaan Project has been chronicling ideas,
            philosophies, and stories of Indian luminaries. With over 320
            episodes, TGP has documented icons like B.V. Doshi, Sudhir
            Patwardhan, Sujata Keshavan, Ramu Ramanathan, Rajat Kapoor, Varun
            Grover, and many more.
          </p>

          <p>
            Kedar is a self-taught designer with 18+ years of experience
            crafting digital experiences. He has previously led design teams at
            Jupiter, BookMyShow, Cleartrip, and Webchutney, and currently serves
            as Director of Design at PropertyGuru in Singapore.
          </p>

          <p>
            KEOS helps repurpose podcast transcripts into structured,
            publishable content — learnings, Q&As, social posts, and more —
            powered by Claude.
          </p>

          <p>
            For more details, reach out at{" "}
            <a
              href="mailto:thegyaanprojectpodcast@gmail.com"
              className="font-medium underline underline-offset-4 transition-colors"
              style={{ color: "#FF6900" }}
            >
              thegyaanprojectpodcast@gmail.com
            </a>
          </p>
        </div>
      </main>

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
