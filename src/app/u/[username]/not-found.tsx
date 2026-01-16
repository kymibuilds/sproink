import Link from "next/link";

export default function UserNotFound() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-6 text-sm text-center items-center">
        {/* 404 Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
          <p className="text-lg">user not found</p>
        </div>

        {/* Divider */}
        <div className="mono text-xs text-muted-foreground">
          ────────────────────────
        </div>

        {/* Message */}
        <p className="text-muted-foreground text-sm max-w-xs">
          this username doesn&apos;t exist yet. want it?
        </p>

        {/* CTA */}
        <a 
          href="https://plob.dev/signup"
          className="text-xs bg-foreground text-background px-4 py-2 hover:opacity-90 transition-opacity"
        >
          claim this username →
        </a>

        {/* Footer */}
        <div className="mono text-xs text-muted-foreground pt-6">
          <Link href="/" className="hover:underline">plob.dev</Link>
        </div>
      </div>
    </div>
  );
}
