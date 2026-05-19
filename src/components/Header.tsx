import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary"
          >
            <rect width="24" height="24" rx="6" fill="currentColor" />
            <path
              d="M7 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm7 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8 14c0-1 1.5-2.5 4-2.5s4 1.5 4 2.5-.5 3.5-4 3.5-4-2.5-4-3.5Z"
              fill="white"
            />
          </svg>
          Bugshot
        </Link>
        <Button asChild size="xl">
          <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noopener noreferrer">
            <span className="hidden sm:inline">Add to Chrome</span>
            <span className="sm:hidden">View in Web Store</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
