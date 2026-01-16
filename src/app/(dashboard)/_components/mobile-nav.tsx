"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, Keyboard } from "lucide-react";

type NavItemProps = { 
  href: string; 
  label: string; 
  shortcut: string; 
  onClick?: () => void; 
};

function NavItem({ href, label, shortcut, onClick }: NavItemProps) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center justify-between group py-2 px-2 hover:bg-muted/50 rounded-sm transition-colors"
    >
      <span className="text-sm font-medium group-hover:underline">{label}</span>
      <span className="mono text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
        {shortcut}
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
        className="flex items-center justify-between group py-2 px-2 hover:bg-muted/50 rounded-sm transition-colors w-full"
      >
        <span className="flex items-center gap-2 text-sm font-medium group-hover:underline">
          <Keyboard className="w-4 h-4 text-muted-foreground" />
          <span>shortcuts</span>
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 pl-4 pr-1 py-1 text-xs text-muted-foreground animate-in slide-in-from-top-1 duration-200">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span>{s.label}</span>
              <span className="mono bg-muted/60 px-1.5 py-0.5 rounded text-[10px] min-w-[1.5rem] text-center border border-border/50">
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
    <div className="flex items-center justify-between py-2 px-2 cursor-not-allowed opacity-50">
      <span className="text-sm font-medium line-through">{label}</span>
      <span className="mono text-[9px] text-muted-foreground">
        soon
      </span>
    </div>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full p-6 gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div 
              className="text-sm font-medium tracking-tight cursor-pointer" 
              onClick={() => {
                setIsOpen(false);
                router.push("/");
              }}
            >
              {username ? `${username}.plob.dev` : "plob.dev"}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-2">
            <NavItem href="/links" label="links" shortcut="g l" onClick={() => setIsOpen(false)} />
            <NavItem href="/analytics" label="analytics" shortcut="g a" onClick={() => setIsOpen(false)} />
            <NavItem href="/blogs" label="blogs" shortcut="g b" onClick={() => setIsOpen(false)} />
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
      </div>
    </div>
  );
}
