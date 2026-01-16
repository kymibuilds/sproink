"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MarkdownPreview } from "@/app/(dashboard)/_components/markdown-preview";
import { Sun, Moon } from "lucide-react";

type Blog = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  views: number;
  createdAt: string;
};

export default function UserBlogPage() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !slug) return;

    fetch(`/api/users/${username}/blogs/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Blog not found");
        return res.json();
      })
      .then((data) => setBlog(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [username, slug]);

  const [isReadingMode, setIsReadingMode] = useState(false);

  // Initialize reading mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("plob-reading-mode");
    if (savedMode === "true") {
      setIsReadingMode(true);
    }
  }, []);

  const toggleReadingMode = () => {
    const newMode = !isReadingMode;
    setIsReadingMode(newMode);
    localStorage.setItem("plob-reading-mode", String(newMode));
  };

  if (isLoading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <span className="text-sm text-muted-foreground mono">loading...</span>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-lg font-medium">[404]</h1>
        <p className="text-sm text-muted-foreground">blog post not found</p>
        <a href="/" className="text-sm hover:underline">← back home</a>
      </main>
    );
  }

  return (
    <main 
      className={`min-h-screen w-full transition-colors duration-500 ease-in-out ${
        isReadingMode ? "bg-[#111111] [&_code]:text-[#e5e5e5] [&_code]:font-mono" : "bg-background"
      }`}
      style={isReadingMode ? {
        // @ts-ignore
        "--foreground": "#d4d4d4",
        "--muted-foreground": "#888888",
        "--muted": "#222222",
        "--border": "#333333",
      } : undefined}
    >
      {/* Main Content Container with Borders */}
      <div className="max-w-4xl mx-auto min-h-screen flex">
        
        {/* Left Border */}
        <div 
          className={`w-4 md:w-8 flex-shrink-0 transition-all duration-500 ${
            isReadingMode 
              ? "border-r border-[#333]" 
              : "border-r border-transparent"
          }`}
          style={
            !isReadingMode ? {
              backgroundImage: "repeating-linear-gradient(45deg, #e5e5e5 0px, #e5e5e5 1px, transparent 1px, transparent 6px)",
              backgroundSize: "8px 8px"
            } : {}
          }
        />

        <article className={`relative flex-1 px-6 md:px-12 py-16 max-w-2xl mx-auto transition-opacity duration-500 ${isReadingMode ? "opacity-100" : "opacity-100"}`}>
          
          {/* Toggle Button (Inside Content) */}
          <button
            onClick={toggleReadingMode}
            className={`absolute top-16 right-6 md:right-12 p-2 rounded-full transition-colors ${
              isReadingMode 
                ? "text-[#666] hover:text-[#d4d4d4] hover:bg-[#222]" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={isReadingMode ? "Switch to Default" : "Soft Reading Mode"}
          >
            {isReadingMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Header */}
          <header className="mb-12">
            <a 
              href={`/u/${username}`}
              className={`text-xs mono mb-6 inline-block hover:underline transition-colors ${
                isReadingMode ? "text-[#888] hover:text-[#d4d4d4]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ← {username}
            </a>
            <h1 className={`text-3xl md:text-4xl font-medium mb-4 leading-tight ${isReadingMode ? "text-[#ededed]" : ""}`}>
              {blog.title}
            </h1>
            <div className={`flex items-center gap-3 text-xs mono ${isReadingMode ? "text-[#555]" : "text-muted-foreground"}`}>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{blog.views} views</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-sm md:prose-base max-w-none">
            <MarkdownPreview content={blog.content || ""} />
          </div>
        </article>

        {/* Right Border */}
        <div 
          className={`w-4 md:w-8 flex-shrink-0 transition-all duration-500 ${
            isReadingMode 
              ? "border-l border-[#333]" 
              : "border-l border-transparent"
          }`}
          style={
            !isReadingMode ? {
              backgroundImage: "repeating-linear-gradient(-45deg, #e5e5e5 0px, #e5e5e5 1px, transparent 1px, transparent 6px)",
              backgroundSize: "8px 8px"
            } : {}
          }
        />
        
      </div>
    </main>
  );
}
