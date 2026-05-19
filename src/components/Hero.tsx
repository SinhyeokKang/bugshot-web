import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="container max-w-screen-xl py-20 lg:py-32">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Bug reporting, built into your browser
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Pick elements, edit CSS, capture screenshots &amp; recordings, and
            file issues to Jira, GitHub, Linear, or Notion — all from a side
            panel.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="xl">
              <a
                href={CHROME_WEB_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="hidden sm:inline">Add to Chrome</span>
                <span className="sm:hidden">View in Web Store</span>
              </a>
            </Button>
            <span className="text-sm text-muted-foreground">
              Free · No account required
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl border bg-muted/50 p-8 lg:p-12">
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            Product mockup
          </div>
        </div>
      </div>
    </section>
  );
}
