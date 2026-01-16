"use client";

import { useState } from "react";
import { ColorPicker } from "./color-picker";

type Feature = "links" | "blogs" | "products" | "integrations";

export type FeatureConfig = Record<Feature, boolean>;

export type LinksLayout = "horizontal" | "vertical";

type Props = {
  value: FeatureConfig;
  onChange: (next: FeatureConfig) => void;
  linksLayout: LinksLayout;
  onLinksLayoutChange: (layout: LinksLayout) => void;
};

export function ToggleBar({ value, onChange, linksLayout, onLinksLayoutChange }: Props) {
  const [showColors, setShowColors] = useState(false);

  const toggle = (key: Feature) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  const toggleLayout = () => {
    onLinksLayoutChange(linksLayout === "horizontal" ? "vertical" : "horizontal");
  };

  const base = "text-xs font-mono transition-all";
  const active = "text-foreground font-bold";
  const inactive = "text-muted-foreground hover:text-foreground";

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-between w-full relative">

      <div className="flex flex-wrap gap-2 md:gap-4 items-center">
        <span className="text-xs font-mono text-muted-foreground mr-1">toggles:</span>
        {(Object.keys(value) as Feature[]).map((key) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            aria-pressed={value[key]}
            className={`${base} ${value[key] ? active : inactive}`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex gap-2 md:gap-4">
        {/* Layout Toggle - only show if links are enabled */}
        {value.links && (
          <button
            onClick={toggleLayout}
            className={`${base} ${inactive}`}
            title="Toggle links layout"
          >
            {linksLayout === "horizontal" ? "→" : "↓"}
          </button>
        )}

        {/* Colors Button */}
        <button
          onClick={() => setShowColors(!showColors)}
          className={`${base} ${showColors ? active : inactive}`}
        >
          colors
        </button>
      </div>

      {/* Color Picker Popup */}
      <ColorPicker isOpen={showColors} onClose={() => setShowColors(false)} />
    </div>
  );
}
