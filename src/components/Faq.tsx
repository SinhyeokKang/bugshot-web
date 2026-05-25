import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { FAQ_KEYS } from "@/lib/constants";

export async function Faq() {
  const t = await getTranslations("faq");

  return (
    <div className="container mx-auto max-w-[960px]">
      <ScrollReveal as="div">
        <h2
          id="faq-heading"
          className="text-center text-3xl font-semibold leading-tight tracking-tight md:text-[40px] md:leading-[48px]"
        >
          {t("heading")}
        </h2>
      </ScrollReveal>
      <ScrollReveal as="div" className="mt-12">
        <Accordion type="single" collapsible defaultValue={FAQ_KEYS[0]}>
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-[18px] font-semibold md:text-[20px]">
                {t(`items.${key}.q`)}
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground">
                {t(`items.${key}.a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  );
}
