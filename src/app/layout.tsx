import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bugshot.dev"),
  title: "Bugshot — Bug Reporting Chrome Extension",
  description:
    "Pick elements, edit CSS, capture screenshots & recordings, and file issues to Jira, GitHub, Linear, or Notion — all from a side panel.",
  openGraph: {
    title: "Bugshot — Bug Reporting Chrome Extension",
    description:
      "Pick elements, edit CSS, capture screenshots & recordings, and file issues to Jira, GitHub, Linear, or Notion — all from a side panel.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Bugshot",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Chrome",
              offers: { "@type": "Offer", price: "0" },
            }),
          }}
        />
      </head>
      <body className="font-pretendard antialiased">{children}</body>
    </html>
  );
}
