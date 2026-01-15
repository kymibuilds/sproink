"use client";

import { useState, useRef, useEffect } from "react";

type LinkItem = {
  id: string;
  name: string;
  url: string;
  clicks: number;
};

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Fetch links on mount
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsAdding(false);
        setNewName("");
        setNewUrl("");
      }
    }

    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding]);

  const handleAdd = async () => {
    if (!newName || !newUrl) return;

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, url: newUrl }),
      });

      if (res.ok) {
        const newLink = await res.json();
        setLinks([newLink, ...links]);
        setIsAdding(false);
        setNewName("");
        setNewUrl("");
      }
    } catch (error) {
      console.error("Failed to add link:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter((link) => link.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-6 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-16 px-6 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-normal">[manage links]</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs bg-foreground text-background px-3 py-1 hover:opacity-90 transition-opacity"
        >
          + add
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Add Form */}
        {isAdding && (
          <div
            ref={formRef}
            className="flex items-center justify-between p-3 border border-border bg-card/50 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="flex flex-col gap-0.5 w-full max-w-[70%]">
              <input
                autoFocus
                type="text"
                placeholder="name"
                className="text-sm font-medium bg-transparent border-none outline-none placeholder:text-muted-foreground/50 p-0"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <input
                type="text"
                placeholder="https://..."
                className="text-[10px] mono bg-transparent border-none outline-none placeholder:text-muted-foreground/50 p-0 text-muted-foreground"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={handleAdd}
              className="text-xs bg-foreground text-background px-3 py-1 hover:opacity-90 transition-opacity"
            >
              save
            </button>
          </div>
        )}

        {/* Empty State */}
        {links.length === 0 && !isAdding && (
          <div className="text-sm text-muted-foreground text-center py-8">
            no links yet. click + add to create one.
          </div>
        )}

        {/* Links List */}
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-3 border border-border bg-card/50 group"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{link.name}</span>
              <span className="text-[10px] text-muted-foreground mono">{link.url}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] mono text-muted-foreground">{link.clicks} clicks</span>
              <div className="flex gap-3 text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                <button className="hover:text-foreground text-muted-foreground">edit</button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="hover:text-red-500 text-muted-foreground"
                >
                  del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


