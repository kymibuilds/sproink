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
  const [colors, setColors] = useState<ColorConfig>({ bg: "#ffffff", text: "#0a0a0a" });
  const popupRef = useRef<HTMLDivElement>(null);

  // Load saved colors on mount
  useEffect(() => {
    const saved = localStorage.getItem("sproink-colors");
    if (saved) {
      const parsed = JSON.parse(saved) as ColorConfig;
      setColors(parsed);
      applyColors(parsed);
    }
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

  const applyColors = (cfg: ColorConfig) => {
    document.documentElement.style.setProperty("--background", cfg.bg);
    document.documentElement.style.setProperty("--foreground", cfg.text);
    document.documentElement.style.setProperty("--card", cfg.bg);
    document.documentElement.style.setProperty("--card-foreground", cfg.text);
  };

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

  const handleChange = (type: "bg" | "text", value: string) => {
    let newColors = { ...colors, [type]: value };

    // Auto-contrast: if colors become too similar, flip the other one
    if (areTooSimilar(newColors.bg, newColors.text)) {
      if (type === "bg") {
        // User changed background, so fix text
        newColors.text = isDark(value) ? "#fafafa" : "#0a0a0a";
      } else {
        // User changed text, so fix background
        newColors.bg = isDark(value) ? "#ffffff" : "#0a0a0a";
      }
    }

    setColors(newColors);
    applyColors(newColors);
    localStorage.setItem("sproink-colors", JSON.stringify(newColors));
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute top-8 right-0 z-50 p-4 border border-border bg-background shadow-lg animate-in fade-in slide-in-from-top-1 duration-200 min-w-[200px]"
    >
      <div className="flex flex-col gap-4">
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
      </div>
    </div>
  );
}
