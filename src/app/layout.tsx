import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const DEFAULT_TITLE = "BugShot — Bug Reports in One Shot";
const DEFAULT_DESCRIPTION =
  "Discover, fix, capture, and report UI bugs in one workflow.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    siteName: "BugShot",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BugShot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  verification: {
    other: {
      "naver-site-verification":
        "79f463827c65e552ad423cf396466a6d9aea1984",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
