import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeqView - Sequence Viewer",
  description: "View, annotate, and share biological sequences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

