"use client";

import { useState, useRef, useEffect } from "react";

const BG_COLORS = [
  { name: "white", value: "#ffffff" },
  { name: "snow", value: "#fafafa" },
  { name: "cream", value: "#f5f5dc" },
  { name: "soft gray", value: "#2a2a2a" },
  { name: "charcoal", value: "#1a1a1a" },
];

const TEXT_COLORS = [
  { name: "charcoal", value: "#1a1a1a" },
  { name: "soft black", value: "#2a2a2a" },
  { name: "warm gray", value: "#4a4a4a" },
  { name: "off white", value: "#f0f0f0" },
  { name: "snow", value: "#fafafa" },
];

type ColorConfig = {
  bg: string;
  text: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ColorPicker({ isOpen, onClose }: Props) {
  const [colors, setColors] = useState<ColorConfig>({ bg: "#ffffff", text: "#1a1a1a" });
  const [isSaving, setIsSaving] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Load saved colors from API on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.bgColor || data.textColor) {
          setColors({
            bg: data.bgColor || "#ffffff",
            text: data.textColor || "#1a1a1a",
          });
        }
      })
      .catch(console.error);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Check if a color is "dark" based on luminance
  const isDark = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Check if two colors are too similar
  const areTooSimilar = (c1: string, c2: string) => {
    return isDark(c1) === isDark(c2);
  };

  const saveColors = async (newColors: ColorConfig) => {
    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bgColor: newColors.bg,
          textColor: newColors.text,
        }),
      });
    } catch (error) {
      console.error("Failed to save colors:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (type: "bg" | "text", value: string) => {
    let newColors = { ...colors, [type]: value };

    // Auto-contrast: if colors become too similar, flip the other one
    if (areTooSimilar(newColors.bg, newColors.text)) {
      if (type === "bg") {
        // User changed background, so fix text
        newColors.text = isDark(value) ? "#fafafa" : "#1a1a1a";
      } else {
        // User changed text, so fix background
        newColors.bg = isDark(value) ? "#ffffff" : "#1a1a1a";
      }
    }

    setColors(newColors);
    saveColors(newColors);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute top-8 right-0 z-50 p-4 border border-border bg-background shadow-lg animate-in fade-in slide-in-from-top-1 duration-200 min-w-[200px]"
    >
      <div className="flex flex-col gap-4">
        <span className="text-[10px] mono text-muted-foreground">public profile colors</span>
        
        {/* Background Colors */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] mono text-muted-foreground">background</span>
          <div className="flex gap-2">
            {BG_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleChange("bg", color.value)}
                className={`w-6 h-6 border-2 transition-all ${
                  colors.bg === color.value
                    ? "border-foreground scale-110"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Text Colors */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] mono text-muted-foreground">text</span>
          <div className="flex gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleChange("text", color.value)}
                className={`w-6 h-6 border-2 transition-all ${
                  colors.text === color.value
                    ? "border-foreground scale-110"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Status indicator */}
        {isSaving && (
          <span className="text-[10px] mono text-muted-foreground">saving...</span>
        )}
      </div>
    </div>
  );
}

