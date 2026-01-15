"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen flex bg-background">
      {/* Main Content Area */}
      <div className="w-64 flex flex-col gap-8 px-6 py-6">
        {/* Brand */}
        <div className="text-sm font-medium tracking-tight cursor-pointer" onClick={() => router.push("/")}>
          nyahh.sproink.dev
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/links" className="hover:underline">
            links
          </Link>
          <Link href="/analytics" className="hover:underline">
            analytics
          </Link>
          <Link href="/blogs" className="hover:underline">
            blogs
          </Link>
          <Link href="/products" className="hover:underline">
            products
          </Link>
          <Link href="/sponsors" className="hover:underline">
            sponsors
          </Link>
          <Link href="/integrations" className="hover:underline">
            integrations
          </Link>
        </nav>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-sm">
          <span>© {new Date().getFullYear()}</span>
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        </div>
      </div>

      {/* Patterned Right Border Track */}
      <div className="w-6 relative border-l border-r border-border h-full">
        <div className="absolute inset-0 bg-diagonal-stripes opacity-40 pointer-events-none" />
      </div>
    </aside>
  );
}
