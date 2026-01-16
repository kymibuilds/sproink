"use client";

import { useRef, useCallback, KeyboardEvent, useEffect } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

type FormatType = "bold" | "italic" | "code" | "link" | "heading";

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in markdown...",
  minHeight = "300px",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea on content change (including paste)
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    // Set height to scrollHeight to fit content
    textarea.style.height = `${Math.max(textarea.scrollHeight, parseInt(minHeight) || 300)}px`;
  }, [minHeight]);

  // Adjust height when value changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  // Also listen for input events (handles paste better)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      // Small delay to ensure value is updated after paste
      requestAnimationFrame(adjustTextareaHeight);
    };

    textarea.addEventListener("input", handleInput);
    return () => textarea.removeEventListener("input", handleInput);
  }, [adjustTextareaHeight]);

  const insertFormat = useCallback(
    (type: FormatType) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      let newText = "";
      let cursorOffset = 0;

      switch (type) {
        case "bold":
          newText = `**${selectedText || "bold text"}**`;
          cursorOffset = selectedText ? newText.length : 2;
          break;
        case "italic":
          newText = `*${selectedText || "italic text"}*`;
          cursorOffset = selectedText ? newText.length : 1;
          break;
        case "code":
          if (selectedText.includes("\n")) {
            newText = `\`\`\`\n${selectedText || "code"}\n\`\`\``;
            cursorOffset = 4;
          } else {
            newText = `\`${selectedText || "code"}\``;
            cursorOffset = selectedText ? newText.length : 1;
          }
          break;
        case "link":
          newText = `[${selectedText || "link text"}](url)`;
          cursorOffset = selectedText ? newText.length - 4 : 1;
          break;
        case "heading":
          newText = `## ${selectedText || "Heading"}`;
          cursorOffset = 3;
          break;
      }

      const newValue = value.substring(0, start) + newText + value.substring(end);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + cursorOffset;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          insertFormat("bold");
          break;
        case "i":
          e.preventDefault();
          insertFormat("italic");
          break;
        case "`":
          e.preventDefault();
          insertFormat("code");
          break;
        case "k":
          e.preventDefault();
          insertFormat("link");
          break;
      }
    }
  };

  return (
    <div className="flex flex-col border border-border bg-card/50">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30">
        <ToolbarButton onClick={() => insertFormat("heading")} title="Heading (H2)">
          H
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("bold")} title="Bold (Ctrl+B)">
          B
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("italic")} title="Italic (Ctrl+I)">
          I
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("code")} title="Code (Ctrl+`)">
          {"<>"}
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("link")} title="Link (Ctrl+K)">
          🔗
        </ToolbarButton>
        <span className="flex-1" />
        <span className="text-[10px] mono text-muted-foreground">
          markdown supported
        </span>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-4 bg-transparent resize-none outline-none mono text-sm leading-relaxed placeholder:text-muted-foreground/50"
        style={{ minHeight }}
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center text-xs mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  );
}
