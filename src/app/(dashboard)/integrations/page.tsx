"use client";

import { useState, useEffect } from "react";

export default function IntegrationsPage() {
  const [githubUsername, setGithubUsername] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [hasGithubToken, setHasGithubToken] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load integration settings on mount
  useEffect(() => {
    fetch("/api/integrations")
      .then((res) => res.json())
      .then((data) => {
        setGithubUsername(data.githubUsername || "");
        setHasGithubToken(data.hasGithubToken || false);
        setGithubEnabled(data.githubEnabled || false);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const saveSettings = async (updates: { githubUsername?: string; githubToken?: string; githubEnabled?: boolean }) => {
    setIsSaving(true);
    try {
      await fetch("/api/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      // Update hasGithubToken if we just set a token
      if (updates.githubToken) {
        setHasGithubToken(true);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGithubToggle = () => {
    const newValue = !githubEnabled;
    setGithubEnabled(newValue);
    saveSettings({ githubEnabled: newValue });
  };

  const handleGithubUsernameBlur = () => {
    saveSettings({ githubUsername });
  };

  const handleGithubTokenBlur = () => {
    if (githubToken) {
      saveSettings({ githubToken });
      setGithubToken(""); // Clear input after saving
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
        <h1 className="text-lg font-normal">[connect apps]</h1>
        {isSaving && <span className="text-[10px] mono text-muted-foreground">saving...</span>}
      </div>

      <div className="flex flex-col gap-4">
        {/* GitHub */}
        <div className="flex flex-col gap-3 p-4 border border-border bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-foreground font-bold text-xs">
                gh
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">github</span>
                <span className="text-[10px] text-muted-foreground mono">show contribution graph</span>
              </div>
            </div>
            <button
              onClick={handleGithubToggle}
              className={`text-xs px-3 py-1 transition-colors ${
                githubEnabled
                  ? "bg-foreground text-background hover:opacity-90"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {githubEnabled ? "enabled" : "disabled"}
            </button>
          </div>
          
          {/* GitHub Username Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] mono text-muted-foreground">github username</label>
            <input
              type="text"
              placeholder="e.g. octocat"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              onBlur={handleGithubUsernameBlur}
              className="text-sm bg-transparent border-b border-border outline-none placeholder:text-muted-foreground/50 pb-1"
            />
          </div>

          {/* GitHub Token Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] mono text-muted-foreground">
              personal access token {hasGithubToken && <span className="text-green-600">✓ saved</span>}
            </label>
            <input
              type="password"
              placeholder={hasGithubToken ? "••••••••••••••••" : "ghp_xxxxxxxxxxxx"}
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              onBlur={handleGithubTokenBlur}
              className="text-sm bg-transparent border-b border-border outline-none placeholder:text-muted-foreground/50 pb-1 font-mono"
            />
            <a 
              href="https://github.com/settings/tokens/new?scopes=read:user&description=plob.dev%20contribution%20graph" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-foreground underline"
            >
              create token (read:user scope) →
            </a>
          </div>
        </div>

        {/* Spotify - placeholder */}
        <div className="flex items-center justify-between p-4 border border-border bg-card/50 opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 font-bold text-xs">
              sp
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">spotify</span>
              <span className="text-[10px] text-muted-foreground mono">coming soon</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">soon</span>
        </div>

        {/* Discord - placeholder */}
        <div className="flex items-center justify-between p-4 border border-border bg-card/50 opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold text-xs">
              dc
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">discord</span>
              <span className="text-[10px] text-muted-foreground mono">coming soon</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">soon</span>
        </div>

        {/* Twitter/X - placeholder */}
        <div className="flex items-center justify-between p-4 border border-border bg-card/50 opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-bold text-xs">
              x
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">twitter / x</span>
              <span className="text-[10px] text-muted-foreground mono">coming soon</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">soon</span>
        </div>
      </div>
    </div>
  );
}
