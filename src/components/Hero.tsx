import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CHROME_WEB_STORE_URL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="container max-w-screen-xl pt-[120px] pb-[60px]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <Image
          src="/bugshot-symbol.svg"
          alt="BugShot"
          width={88}
          height={88}
          priority
          className="h-[88px] w-[88px]"
        />
        <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[60px] lg:leading-[1.28]">
          Bug Reports in One Shot
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg lg:leading-[34px]">
          Discover, fix, capture,
          <br />
          and report UI bugs in one workflow.
        </p>
        <Button asChild size="xl" className="mt-8">
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Add to Chrome
          </a>
        </Button>
        <span className="mt-4 text-sm text-muted-foreground">
          Free · No account required
        </span>
      </div>
    </section>
  );
}
