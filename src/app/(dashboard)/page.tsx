"use client";
import { FeatureConfig, ToggleBar } from "./_components/toggle-bar";
import { useState, useEffect } from "react";

type LinkItem = {
  id: string;
  name: string;
  url: string;
};

export default function MyPage() {
  const [features, setFeatures] = useState<FeatureConfig>({
    links: true,
    blogs: true,
    products: true,
    integrations: true,
  });

  const [links, setLinks] = useState<LinkItem[]>([]);

  // Fetch links on mount
  useEffect(() => {
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch(console.error);
  }, []);

  // Mock data (blogs & products remain mock for now)
  const blogs = [
    "building a minimal saas with next.js",
    "why text-first uis scale better",
    "auth patterns that don't suck",
  ];
  const products = [
    { name: "minimal saas starter", price: "$149", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop" },
    { name: "auth patterns guide", price: "$29", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=200&fit=crop" },
    { name: "dashboard kit", price: "free", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" },
    { name: "icon pack v2", price: "$19", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop" },
    { name: "component library", price: "$79", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&h=200&fit=crop" },
    { name: "email templates", price: "$39", image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=300&h=200&fit=crop" },
  ];

  return (
    <main className="w-full min-h-screen flex justify-center px-6 py-16">
      <div className="w-full max-w-lg fixed top-4">
        <ToggleBar value={features} onChange={setFeatures} />
      </div>
      
      <div className="w-full max-w-lg flex flex-col gap-10 text-sm text-center items-center">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-normal">[nyahh]</h1>
        </div>

        {/* Divider */}
        <div className="mono text-xs text-muted-foreground">
          ────────────────────────
        </div>

        {/* Links */}
        {features.links && links.length > 0 && (
          <section className="flex flex-col gap-4 items-center">
            <h2 className="mono text-xs text-muted-foreground">［ links ］</h2>
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
          </section>
        )}

        {/* Blogs */}
        {features.blogs && (
          <section className="flex flex-col gap-4 items-center">
            <h2 className="mono text-xs text-muted-foreground">［ blogs ］</h2>
            <div className="flex flex-col gap-2">
              {blogs.map((blog) => (
                <a key={blog} className="hover:underline">
                  {blog}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        {features.products && (
          <section className="flex flex-col gap-4 items-center w-full">
            <h2 className="mono text-xs text-muted-foreground">［ products ］</h2>
            <div className="grid grid-cols-3 gap-2 w-full">
              {products.map((product) => (
                <a
                  key={product.name}
                  className="flex flex-col group cursor-pointer border border-border bg-card/50 hover:border-foreground/20 transition-colors"
                >
                  <div className="aspect-[3/2] overflow-hidden border-b border-border">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
          sproink.dev/nyahh
        </div>
      </div>
    </main>
  );
}
