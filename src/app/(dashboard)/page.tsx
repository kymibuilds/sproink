"use client";
import { FeatureConfig, LinksLayout, ToggleBar } from "./_components/toggle-bar";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";
import { useState, useEffect } from "react";
import { GitHubContributionGraph } from "@/components/github-contribution-graph";
import type { Activity } from "@/components/kibo-ui/contribution-graph";

type LinkItem = {
  id: string;
  name: string;
  url: string;
};

type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
};

type Blog = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  isExternal?: boolean;
  externalUrl?: string | null;
};

type UserInfo = {
  username: string;
  bio: string | null;
};

export default function MyPage() {
  const [features, setFeatures] = useState<FeatureConfig>({
    links: true,
    blogs: true,
    products: true,
    integrations: true,
  });
  const [linksLayout, setLinksLayout] = useState<LinksLayout>("horizontal");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [githubContributions, setGithubContributions] = useState<Activity[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings and data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          // Fetch user info
          fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
              if (data.username) {
                setUser({ username: data.username, bio: data.bio || null });
              }
            })
            .catch(() => {}),

          // Fetch visibility settings
          fetch("/api/settings")
            .then((res) => res.json())
            .then((data) => {
              setFeatures({
                links: data.showLinks ?? true,
                blogs: data.showBlogs ?? true,
                products: data.showProducts ?? true,
                integrations: data.showIntegrations ?? true,
              });
              setLinksLayout(data.linksLayout ?? "horizontal");
              setSettingsLoaded(true);
            })
            .catch(() => setSettingsLoaded(true)),

          // Fetch content
          fetch("/api/links")
            .then((res) => res.json())
            .then((data) => setLinks(data))
            .catch(() => {}),

          fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch(() => {}),

          fetch("/api/blogs")
            .then((res) => res.json())
            .then((data) => setBlogs(data))
            .catch(() => {}),

          // Fetch GitHub contributions (via our proxy API)
          fetch("/api/integrations/github")
            .then((res) => {
              if (res.ok) return res.json();
              return { contributions: [] };
            })
            .then((data) => {
              if (data.contributions) {
                setGithubContributions(data.contributions);
              }
            })
            .catch(() => {
              // Silently fail - GitHub integration is optional
            }),
        ]);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save settings when features change (but not on initial load)
  const handleFeaturesChange = (newFeatures: FeatureConfig) => {
    setFeatures(newFeatures);
    saveSettings({ features: newFeatures });
  };

  const handleLinksLayoutChange = (newLayout: LinksLayout) => {
    setLinksLayout(newLayout);
    saveSettings({ linksLayout: newLayout });
  };

  const saveSettings = (updates: { features?: FeatureConfig; linksLayout?: LinksLayout }) => {
    // Only save if settings have been loaded (avoid saving default state)
    if (!settingsLoaded) return;

    const payload: Record<string, unknown> = {};
    
    if (updates.features) {
      payload.showLinks = updates.features.links;
      payload.showBlogs = updates.features.blogs;
      payload.showProducts = updates.features.products;
      payload.showIntegrations = updates.features.integrations;
    }
    
    if (updates.linksLayout) {
      payload.linksLayout = updates.linksLayout;
    }

    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(console.error);
  };

  // Filter to only active items
  const activeProducts = products.filter((p) => p.isActive);
  const publishedBlogs = blogs.filter((b) => b.published);

  const username = user?.username || "...";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full min-h-screen flex justify-center px-6 pt-24 pb-16 md:py-16">

      <div className="w-full max-w-lg fixed top-14 md:top-6 left-1/2 -translate-x-1/2 px-6 z-40">
        <ToggleBar 
          value={features} 
          onChange={handleFeaturesChange}
          linksLayout={linksLayout}
          onLinksLayoutChange={handleLinksLayoutChange}
        />
      </div>

      
      <div className="w-full max-w-lg flex flex-col gap-10 text-sm text-center items-center">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-normal">[{username}]</h1>
          {user?.bio && (
            <p className="text-muted-foreground text-xs max-w-xs">{user.bio}</p>
          )}
        </div>

        {/* GitHub Contributions */}
        {features.integrations && githubContributions.length > 0 && (
          <GitHubContributionGraph data={githubContributions} />
        )}

        {/* Divider */}
        <div className="mono text-xs text-muted-foreground">
          ────────────────────────
        </div>

        {/* Links */}
        {features.links && links.length > 0 && (
          <section className="flex flex-col gap-4 items-center">
            <h2 className="mono text-xs text-muted-foreground">［ links ］</h2>
            {linksLayout === "horizontal" ? (
              <div className="text-center max-w-xs leading-relaxed">
                {links.map((link, i) => (
                  <span key={link.id}>
                    {i > 0 && <span className="text-muted-foreground mx-2">•</span>}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline cursor-pointer">
                      {link.name}
                    </a>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <a 
                    key={link.id}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Blogs */}
        {features.blogs && publishedBlogs.length > 0 && (
          <section className="flex flex-col gap-4 items-center">
            <h2 className="mono text-xs text-muted-foreground">［ blogs ］</h2>
            <div className="flex flex-col gap-2">
              {publishedBlogs.map((blog) => {
                 const isExternal = blog.isExternal;
                 const href = isExternal ? blog.externalUrl || "#" : `/blog/${blog.slug}`;
                 const target = isExternal ? "_blank" : undefined;
                 
                 return (
                  <a 
                    key={blog.id} 
                    href={href}
                    target={target}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {blog.title}
                    {isExternal && <span className="text-[9px] -mt-1">↗</span>}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Products */}
        {features.products && activeProducts.length > 0 && (
          <section className="flex flex-col gap-4 items-center w-full">
            <h2 className="mono text-xs text-muted-foreground">［ products ］</h2>
            <div className="grid grid-cols-3 gap-2 w-full">
              {activeProducts.map((product) => (
                <a
                  key={product.id}
                  className="flex flex-col group cursor-pointer border border-border bg-card/50 hover:border-foreground/20 transition-colors"
                >
                  {product.imageUrl ? (
                    <div className="aspect-[3/2] overflow-hidden border-b border-border">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/2] bg-muted/50 border-b border-border flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">no image</span>
                    </div>
                  )}
                  <div className="flex flex-col text-left p-2">
                    <span className="text-xs group-hover:underline truncate">{product.name}</span>
                    <span className="mono text-[10px] text-muted-foreground">{product.price}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mono text-xs text-muted-foreground pt-6">
          {username}.plob.dev
        </div>
      </div>
    </div>
  );
}
