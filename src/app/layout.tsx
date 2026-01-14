import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Microsoft Store Downloader",
  description:
    "Clean, unofficial Microsoft Store downloader with architecture grouping and file size detection."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          bg-slate-100 text-slate-900
          dark:bg-slate-950 dark:text-white
          antialiased
        "
      >
        {children}
      </body>
    </html>
  );
}
