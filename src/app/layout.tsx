import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

// <html>/<body> live in app/[locale]/layout.tsx so `lang` is resolved
// server-side from the route locale (next-intl [locale] pattern). This root
// layout is a passthrough.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
