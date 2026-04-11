import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SoftMicro — Microsoft Store Downloader",
  description:
    "Download Microsoft Store apps directly. Search by Product ID or Store URL, then grab any package — MSIX, AppX bundle, or more.",
  keywords: ["microsoft store", "download", "msix", "appx", "windows app"],
  openGraph: {
    title: "SoftMicro",
    description: "Download Microsoft Store apps directly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} dark`}
    >
      <body className="bg-surface text-slate-100 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
