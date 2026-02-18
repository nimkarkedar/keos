import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full" style={{ backgroundColor: "#222222", paddingTop: "10px", paddingBottom: "10px" }}>
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between pl-0 pr-6">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={200} height={83} className="invert" priority />
        </Link>
        <Link href="/about" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
          About
        </Link>
      </div>
    </nav>
  );
}
