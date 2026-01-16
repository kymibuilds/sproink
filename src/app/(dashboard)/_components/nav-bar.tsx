"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Keyboard } from "lucide-react";

function NavItem({ href, label, shortcut }: { href: string; label: string; shortcut: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center justify-between group py-0.5 hover:bg-muted/50 -mx-2 px-2 transition-colors"
    >
      <span className="group-hover:underline">{label}</span>
      <span className="mono text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
        g {shortcut}
      </span>
    </Link>
  );
}

function ShortcutsAccordion() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isListPage = pathname === "/links" || pathname === "/blogs";

  const shortcuts = isListPage ? [
    { key: "a", label: "new" },
    { key: "e", label: "edit" },
    { key: "d", label: "delete" },
    { key: "j/k", label: "navigate" },
    { key: "↵", label: "select" },
    { key: "?", label: "help" },
  ] : [
    { key: "?", label: "help" },
    { key: "g +", label: "nav" },
  ];

  return (
    <div className="flex flex-col gap-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between group py-0.5 hover:bg-muted/50 -mx-2 px-2 transition-colors w-[calc(100%+1rem)]"
      >
        <span className="flex items-center gap-2 group-hover:underline">
          <Keyboard className="w-3 h-3 text-muted-foreground" />
          <span>shortcuts</span>
        </span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1 pl-4 pr-1 py-1 text-xs text-muted-foreground animate-in slide-in-from-top-1 duration-200">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span>{s.label}</span>
              <span className="mono bg-muted/60 px-1 rounded text-[10px] min-w-[1.2rem] text-center border border-border/50">
                {s.key}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DisabledNavItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 -mx-2 px-2 cursor-not-allowed opacity-50">
      <span className="line-through">{label}</span>
      <span className="mono text-[9px] text-muted-foreground">
        soon
      </span>
    </div>
  );
}


export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setUsername(data.username);
      })
      .catch(console.error);
  }, []);

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
          {username ? `${username}.plob.dev` : "plob.dev"}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-sm">
          <NavItem href="/links" label="links" shortcut="l" />
          <NavItem href="/analytics" label="analytics" shortcut="a" />
          <NavItem href="/blogs" label="blogs" shortcut="b" />
          <DisabledNavItem label="products" />
          <DisabledNavItem label="sponsors" />
          <DisabledNavItem label="integrations" />
          <ShortcutsAccordion />
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
