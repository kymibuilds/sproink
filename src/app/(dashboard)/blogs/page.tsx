"use client";

import { useState, useRef, useEffect } from "react";
import { BlogEditor } from "../_components/blog-editor";
import { useKeyboard } from "@/components/keyboard-provider";

type Blog = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  published: boolean;
  views: number;
  isExternal: boolean;
  externalUrl: string | null;
  createdAt: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<"post" | "link">("post");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newExternalUrl, setNewExternalUrl] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  const { registerAction, unregisterAction } = useKeyboard();

  // Register keyboard actions
  useEffect(() => {
    registerAction("down", () => {
      if (pendingDeleteId) return; // Ignore during delete confirmation
      setFocusedIndex((i) => Math.min(i + 1, blogs.length - 1));
    });
    registerAction("up", () => {
      if (pendingDeleteId) return;
      setFocusedIndex((i) => Math.max(i - 1, 0));
    });
    registerAction("new", () => {
      if (pendingDeleteId) return;
      handleAddStart("post");
    });
    registerAction("edit", () => {
      if (pendingDeleteId) return;
      const blog = blogs[focusedIndex];
      if (blog && !blog.isExternal) setEditingBlog(blog);
    });
    registerAction("delete", () => {
      if (pendingDeleteId) return;
      const blog = blogs[focusedIndex];
      if (blog) {
        setPendingDeleteId(blog.id);
      }
    });
    registerAction("select", () => {
      if (pendingDeleteId) return;
      const blog = blogs[focusedIndex];
      if (blog && !blog.isExternal) setEditingBlog(blog);
    });
    registerAction("cancel", () => {
      setIsAdding(false);
      setPendingDeleteId(null);
      setNewTitle("");
      setNewSlug("");
      setNewDescription("");
      setNewExternalUrl("");
    });
    registerAction("p", () => {
      if (pendingDeleteId) return;
      const blog = blogs[focusedIndex];
      // Only execute if not already published
      if (blog && !blog.published) handleSetPublish(blog.id, true);
    });
    registerAction("u", () => {
      if (pendingDeleteId) return;
      const blog = blogs[focusedIndex];
      // Only execute if already published
      if (blog && blog.published) handleSetPublish(blog.id, false);
    });

    return () => {
      unregisterAction("down");
      unregisterAction("up");
      unregisterAction("new");
      unregisterAction("edit");
      unregisterAction("delete");
      unregisterAction("select");
      unregisterAction("cancel");
      unregisterAction("p");
      unregisterAction("u");
    };
  }, [blogs, focusedIndex, pendingDeleteId, registerAction, unregisterAction]);


  // Handle y/n for delete confirmation
  useEffect(() => {
    if (!pendingDeleteId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleDelete(pendingDeleteId);
        setPendingDeleteId(null);
      } else if (e.key.toLowerCase() === "n" || e.key === "Escape") {
        e.preventDefault();
        setPendingDeleteId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDeleteId]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsAdding(false);
        resetForm();
      }
    }

    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding]);

  const resetForm = () => {
    setNewTitle("");
    setNewSlug("");
    setNewDescription("");
    setNewExternalUrl("");
  };

  // Auto-generate slug from title (only for posts)
  useEffect(() => {
    if (isAdding && addMode === "post" && newTitle) {
      const slug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setNewSlug(slug);
    }
  }, [newTitle, isAdding, addMode]);

  const handleAddStart = (mode: "post" | "link") => {
    setAddMode(mode);
    setIsAdding(true);
    resetForm();
  };

  const handleAdd = async () => {
    if (!newTitle) return;
    if (addMode === "post" && !newSlug) return;
    if (addMode === "link" && !newExternalUrl) return;

    // For links, generate a dummy slug if needed, or backend can handle it.
    // We'll use a random slug for links to satisfy the constraint if needed, 
    // or the backend logic we just wrote requires slug. 
    // Let's generate a slug for links too for consistency in the DB.
    const effectiveSlug = addMode === "link" 
      ? `link-${crypto.randomUUID().slice(0, 8)}` 
      : newSlug;

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          slug: effectiveSlug,
          description: newDescription || null,
          isExternal: addMode === "link",
          externalUrl: addMode === "link" ? newExternalUrl : null,
        }),
      });

      if (res.ok) {
        const newBlog = await res.json();
        setBlogs([newBlog, ...blogs]);
        setIsAdding(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create blog:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const handleSetPublish = async (id: string, shouldPublish: boolean) => {
    // Check limit if publishing
    if (shouldPublish) {
      const currentPublishedCount = blogs.filter(b => b.published).length;
      const targetBlog = blogs.find(b => b.id === id);
      // If we are publishing a draft, and we are at or over limit
      if (!targetBlog?.published && currentPublishedCount >= 5) {
        window.alert("Limit reached: You can only have 5 active blogs at a time.");
        return;
      }
    }

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: shouldPublish }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBlogs(blogs.map((b) => (b.id === id ? updated : b)));
      }
    } catch (error) {
      console.error("Failed to update blog:", error);
    }
  };

  const handleTogglePublish = (id: string, currentPublished: boolean) => {
    handleSetPublish(id, !currentPublished);
  };

  const handleSaveBlog = async (title: string, content: string) => {
    if (!editingBlog) return;

    const res = await fetch(`/api/blogs/${editingBlog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      const updated = await res.json();
      setBlogs(blogs.map((b) => (b.id === editingBlog.id ? updated : b)));
    } else {
      throw new Error("Failed to save");
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewTitle("");
      setNewSlug("");
      setNewDescription("");
      setNewExternalUrl("");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-6 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">loading...</span>
      </div>
    );
  }

  const publishedCount = blogs.filter(b => b.published).length;

  return (
    <div className="w-full max-w-md mx-auto py-16 px-6 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-normal">[manage posts]</h1>
          <span className="text-xs text-muted-foreground mono hidden md:inline">
            ({publishedCount}/5 active)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAddStart("post")}
            className="text-xs bg-foreground text-background px-3 py-1 hover:opacity-90 transition-opacity"
          >
            + write
          </button>
          <button
            onClick={() => handleAddStart("link")}
            className="text-xs border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1 transition-colors"
          >
            + link
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Add Form */}
        {isAdding && (
          <div
            ref={formRef}
            className="flex flex-col gap-3 p-4 border border-border bg-card/50 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                type="text"
                placeholder={addMode === "post" ? "post title" : "link title"}
                className="text-sm font-medium bg-transparent border-b border-border outline-none placeholder:text-muted-foreground/50 pb-1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleAddKeyDown}
              />
              
              {addMode === "post" ? (
                <input
                  type="text"
                  placeholder="slug-url"
                  className="text-xs mono bg-transparent border-b border-border outline-none placeholder:text-muted-foreground/50 pb-1 text-muted-foreground"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                />
              ) : (
                <input
                  type="text"
                  placeholder="https://external-site.com/article"
                  className="text-xs mono bg-transparent border-b border-border outline-none placeholder:text-muted-foreground/50 pb-1 text-muted-foreground"
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                />
              )}

              <textarea
                placeholder="short description..."
                rows={2}
                className="text-xs bg-transparent border-b border-border outline-none placeholder:text-muted-foreground/50 pb-1 text-muted-foreground resize-none"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={handleAddKeyDown}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAdd}
                className="text-xs bg-foreground text-background px-3 py-1 hover:opacity-90 transition-opacity"
              >
                {addMode === "post" ? "create draft" : "add link"}
              </button>
            </div>
          </div>
        )}


        {/* Empty State */}
        {blogs.length === 0 && !isAdding && (
          <div className="text-sm text-muted-foreground text-center py-8">
            no posts yet. click + write to create one.
          </div>
        )}

        {/* Blogs List */}
        {blogs.map((blog, index) => {
          const isPendingDelete = pendingDeleteId === blog.id;
          
          return (
          <article
            key={blog.id}
            className={`flex flex-col gap-2 p-3 border bg-card/50 group transition-all relative cursor-pointer hover:bg-card/80 ${
              !blog.published ? "opacity-75 border-dashed" : "border-border"
            } ${
              index === focusedIndex && !isPendingDelete
                ? "border-l-2 border-l-foreground border-solid" 
                : ""
            } ${
              isPendingDelete 
                ? "border-red-500 bg-red-500/5" 
                : ""
            }`}
            onClick={() => !blog.isExternal && !isPendingDelete && setEditingBlog(blog)}
          >
            {/* Delete Confirmation Overlay */}
            {isPendingDelete && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-[1px] z-10 gap-3 animate-in fade-in duration-200">
                <span className="text-sm text-destructive font-medium">delete "{blog.title}"?</span>
                <div className="flex items-center gap-6 text-xs mono text-muted-foreground">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors group/btn"
                    onClick={() => {
                        handleDelete(blog.id);
                        setPendingDeleteId(null);
                    }}
                  >
                    <kbd className="min-w-[20px] h-5 flex items-center justify-center bg-background border border-border rounded text-[10px] group-hover/btn:border-foreground/50 transition-colors">y</kbd>
                    <span>verify</span>
                  </div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors group/btn"
                    onClick={() => setPendingDeleteId(null)}
                  >
                    <kbd className="min-w-[20px] h-5 flex items-center justify-center bg-background border border-border rounded text-[10px] group-hover/btn:border-foreground/50 transition-colors">n</kbd>
                    <span>cancel</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center text-center flex-1 mr-4">
                <div className="flex items-center gap-2 justify-center">
                  <span className="font-medium text-sm">{blog.title}</span>
                  {/* Hover arrow */}
                  <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                  {blog.isExternal && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-1 py-0.5 rounded-sm">
                      link
                    </span>
                  )}
                </div>
                {blog.isExternal ? (
                  <a 
                    href={blog.externalUrl || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mono text-[10px] text-muted-foreground hover:underline truncate max-w-[200px]"
                  >
                    {blog.externalUrl} ↗
                  </a>
                ) : (
                  <span className="mono text-[10px] text-muted-foreground">/{blog.slug}</span>
                )}
              </div>
              <button
                onClick={() => handleTogglePublish(blog.id, blog.published)}
                className={`mono text-[10px] px-1.5 py-0.5 cursor-pointer transition-colors ${
                  blog.published
                    ? "bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600"
                    : "bg-yellow-500/10 text-yellow-600 hover:bg-green-500/10 hover:text-green-600"
                }`}
              >
                {blog.published ? (
                  <>
                    <span className="group-hover:hidden">published</span>
                    <span className="hidden group-hover:inline">unpublish</span>
                  </>
                ) : (
                  <>
                    <span className="group-hover:hidden">draft</span>
                    <span className="hidden group-hover:inline">publish</span>
                  </>
                )}
              </button>
            </div>
            
            {blog.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {blog.description}
              </p>
            )}

            <div className="flex justify-between items-center mt-1 pt-2 border-t border-border/50">
               <span className="mono text-[10px] text-muted-foreground">
                 {new Date(blog.createdAt).toLocaleDateString()} · {blog.views} views
               </span>
               <div className="flex gap-3 text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                  {!blog.isExternal && (
                    <button 
                      onClick={() => setEditingBlog(blog)}
                      className="hover:text-foreground text-muted-foreground"
                    >
                      edit
                    </button>
                  )}
                  <button 
                    onClick={() => setPendingDeleteId(blog.id)}
                    className="hover:text-red-500 text-muted-foreground"
                  >
                    del
                  </button>
               </div>
            </div>
          </article>
        )})}


      </div>

      {/* Blog Editor Modal */}
      {editingBlog && (
        <BlogEditor
          blogId={editingBlog.id}
          initialTitle={editingBlog.title}
          initialContent={editingBlog.content || ""}
          onSave={handleSaveBlog}
          onClose={() => setEditingBlog(null)}
        />
      )}
    </div>
  );
}
