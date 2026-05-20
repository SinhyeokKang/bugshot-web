import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function BottomCta() {
  return (
    <section className="border-t bg-primary py-16 lg:py-24">
      <div className="container flex max-w-screen-xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Stop jumping between tools
        </h2>
        <p className="max-w-lg text-primary-foreground/80">
          Install BugShot and ship fully documented issues — diffs, logs,
          screenshots, recordings — in seconds.
        </p>
        <Button
          asChild
          size="xl"
          variant="secondary"
        >
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="hidden sm:inline">Add to Chrome</span>
            <span className="sm:hidden">View in Web Store</span>
          </a>
        </Button>
      </div>
    </section>
  );
}
