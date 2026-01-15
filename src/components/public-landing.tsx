import Link from "next/link";
import { CenteredLayout } from "./centered-layout";

export function PublicLanding() {
  return (
    <>
    <CenteredLayout>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-medium">sproink</h1>
        <p className="text-sm">
          linktree but better. <br /> <span className="text-xs text-muted-foreground">
            blogs, sponsors, integrations and everything in between
          </span>
        </p>

        <div className="flex gap-3 text-sm">
          <Link href="/login" className="hover:underline">
            sign in
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/signup" className="hover:underline">
            sign up
          </Link>
        </div>
      </div>
    </CenteredLayout>
    <div className="fixed bottom-4 text-center w-full">
      <p className="text-xs text-muted-foreground">made with <span className="text-red-500">{"<3"}</span> by <a href="https://www.kymi.dev">nyahh</a></p>
    </div>
    </>
    
    
  );
}
