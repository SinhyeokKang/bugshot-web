"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { REVIEW_KEYS, CHROME_WEB_STORE_REVIEWS_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Review() {
  const t = useTranslations("review");
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const pausedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldAutoPlay = REVIEW_KEYS.length > 1;

  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!shouldAutoPlay || prefersReducedMotion.current || pausedRef.current)
      return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % REVIEW_KEYS.length);
    }, 8000);
  }, [shouldAutoPlay, clearTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  useEffect(() => {
    if (!shouldAutoPlay) return;
    function handleVisibility() {
      if (document.hidden) {
        clearTimer();
      } else if (!pausedRef.current) {
        startTimer();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [shouldAutoPlay, clearTimer, startTimer]);

  function pause() {
    pausedRef.current = true;
    clearTimer();
  }

  function resume() {
    pausedRef.current = false;
    startTimer();
  }

  function goTo(index: number) {
    setActive(index);
    if (!pausedRef.current) startTimer();
  }

  function handleArrowKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next =
        e.key === "ArrowRight"
          ? (active + 1) % REVIEW_KEYS.length
          : (active - 1 + REVIEW_KEYS.length) % REVIEW_KEYS.length;
      goTo(next);
      dotRefs.current[next]?.focus();
    }
  }

  return (
    <div
      ref={containerRef}
      className="container mx-auto max-w-[960px] flex flex-col items-center gap-5"
      onMouseEnter={shouldAutoPlay ? pause : undefined}
      onMouseLeave={shouldAutoPlay ? resume : undefined}
      onFocusCapture={shouldAutoPlay ? pause : undefined}
      onBlurCapture={shouldAutoPlay ? (e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          resume();
        }
      } : undefined}
    >
      <h2 className="sr-only">{t("srHeading")}</h2>
      <div className="grid w-full">
        {REVIEW_KEYS.map((key, i) => (
          <div
            key={key}
            className={cn(
              "col-start-1 row-start-1 flex flex-col items-center gap-5 transition-opacity ease-out",
              prefersReducedMotion.current ? "duration-0" : "duration-300",
              i === active
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            aria-hidden={i !== active}
          >
            <p className="text-sm text-muted-foreground md:text-base">
              {t(`items.${key}.author`)}
            </p>
            <blockquote className="text-center text-xl font-medium leading-[140%] tracking-tight md:text-[32px]">
              {`“${t(`items.${key}.quote`)}”`}
            </blockquote>
            <cite className="not-italic text-sm text-muted-foreground md:text-base">
              <a
                href={CHROME_WEB_STORE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={i === active ? 0 : -1}
                className="hover:text-brand focus-visible:text-brand focus-visible:outline-none"
              >
                {t(`items.${key}.source`)}
              </a>
            </cite>
          </div>
        ))}
      </div>
      {shouldAutoPlay && (
        <div
          className="mt-3 flex justify-center"
          role="tablist"
          aria-label={t("srHeading")}
        >
          {REVIEW_KEYS.map((_, i) => (
            <button
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              type="button"
              role="tab"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => goTo(i)}
              onKeyDown={handleArrowKey}
              aria-label={t("dotLabel", { index: i + 1 })}
              className="group flex items-center justify-center h-6 w-6"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-300",
                  i === active ? "bg-foreground" : "bg-foreground/20 group-hover:bg-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
