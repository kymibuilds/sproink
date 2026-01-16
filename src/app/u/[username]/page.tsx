import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { users, userSettings, links, blogs, products } from "@/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { username: true, bio: true },
  });

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  const title = `${user.username} | plob.dev`;
  const description = user.bio || `Check out ${user.username}'s links, blogs, and more on plob.dev`;
  const ogImage = `https://plob.dev/api/og/${user.username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://${user.username}.plob.dev`,
      siteName: "plob.dev",
      type: "profile",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${user.username}'s profile on plob.dev`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  // Fetch user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: {
      id: true,
      username: true,
      bio: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch user settings
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id),
  });

  const showLinks = settings?.showLinks ?? true;
  const showBlogs = settings?.showBlogs ?? true;
  const showProducts = settings?.showProducts ?? true;
  const linksLayout = settings?.linksLayout ?? "horizontal";
  const bgColor = settings?.bgColor ?? null;
  const textColor = settings?.textColor ?? null;

  // Fetch content based on settings
  const [userLinks, userBlogs, userProducts] = await Promise.all([
    showLinks
      ? db.query.links.findMany({
          where: eq(links.userId, user.id),
          orderBy: [asc(links.order)],
        })
      : [],
    showBlogs
      ? db.query.blogs.findMany({
          where: and(eq(blogs.userId, user.id), eq(blogs.published, true)),
          orderBy: [desc(blogs.createdAt)],
        })
      : [],
    showProducts
      ? db.query.products.findMany({
          where: and(eq(products.userId, user.id), eq(products.isActive, true)),
          orderBy: [desc(products.createdAt)],
        })
      : [],
  ]);

  // Build custom style object for colors
  const customStyle: React.CSSProperties = {};
  if (bgColor) {
    customStyle.backgroundColor = bgColor;
  }
  if (textColor) {
    customStyle.color = textColor;
  }

  return (
    <div 
      className="w-full min-h-screen flex justify-center px-6 py-16 relative"
      style={customStyle}
    >
      {/* Promo Banner */}
      <a 
        href="https://plob.dev/signup"
        className="fixed top-4 left-4 text-[10px] mono text-muted-foreground hover:text-foreground transition-colors z-50"
      >
        claim your plob.dev →
      </a>

      <div className="w-full max-w-lg flex flex-col gap-10 text-sm text-center items-center">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-normal">[{user.username}]</h1>
          {user.bio && (
            <p className="text-muted-foreground text-xs max-w-xs">{user.bio}</p>
          )}
        </div>

        {/* Divider */}
        <div className="mono text-xs text-muted-foreground">
          ────────────────────────
        </div>

        {/* Links */}
        {showLinks && userLinks.length > 0 && (
          <section className="flex flex-col gap-4 items-center">
            <h2 className="mono text-xs text-muted-foreground">［ links ］</h2>
            {linksLayout === "horizontal" ? (
              <div className="text-center max-w-xs leading-relaxed">
                {userLinks.map((link, i) => (
                  <span key={link.id}>
                    {i > 0 && <span className="text-muted-foreground mx-2">•</span>}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline cursor-pointer truncate max-w-[150px] inline-block align-bottom"
                    >
                      {link.name}
                    </a>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {userLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer truncate"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Blogs */}
        {showBlogs && userBlogs.length > 0 && (
          <section className="flex flex-col gap-4 items-center">
            <h2 className="mono text-xs text-muted-foreground">［ blogs ］</h2>
            <div className="flex flex-col gap-2 items-center w-full">
              {userBlogs.map((blog) => {
                const isExternal = blog.isExternal;
                const href = isExternal
                  ? blog.externalUrl || "#"
                  : `/blog/${blog.slug}`;
                const target = isExternal ? "_blank" : undefined;

                return (
                  <a
                    key={blog.id}
                    href={href}
                    target={target}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="group flex items-center justify-center gap-1.5 cursor-pointer transition-all w-full relative max-w-xs"
                  >
                    <span className="text-muted-foreground text-[10px] no-underline flex-shrink-0">•</span>
                    <span className="group-hover:underline underline-offset-4 decoration-muted-foreground/50 truncate">{blog.title}</span>
                    {isExternal ? (
                      <span className="text-[9px] text-muted-foreground -mt-1 no-underline">↗</span>
                    ) : (
                      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs no-underline translate-x-[-4px] group-hover:translate-x-0 duration-200">→</span>
                    )}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Products */}
        {showProducts && userProducts.length > 0 && (
          <section className="flex flex-col gap-4 items-center w-full">
            <h2 className="mono text-xs text-muted-foreground">
              ［ products ］
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
              {userProducts.map((product) => (
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
                      <span className="text-[10px] text-muted-foreground">
                        no image
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col text-left p-2">
                    <span className="text-xs group-hover:underline truncate">
                      {product.name}
                    </span>
                    <span className="mono text-[10px] text-muted-foreground">
                      {product.price}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mono text-xs text-muted-foreground pt-6">
          {user.username}.plob.dev
        </div>
      </div>
    </div>
  );
}
