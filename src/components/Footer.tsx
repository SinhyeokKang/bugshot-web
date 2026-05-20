import { SiGooglechrome } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="py-24 md:py-[200px]">
      <div className="container mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-[60px] md:leading-[1.28]">
          Stop jumping between tools
        </h2>
        <p className="mt-4 text-base font-medium leading-snug text-muted-foreground md:text-lg">
          Link your platforms from the Integrations tab.
          <br />
          Connect multiple at once and choose where each ticket goes.
        </p>
        <Button asChild size="xl" className="mt-8">
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGooglechrome color="currentColor" />
            Add to Chrome
          </a>
        </Button>
        <span className="mt-8 text-base text-muted-foreground">
          © 2026 BugShot
        </span>
      </div>
    </footer>
  );
}
