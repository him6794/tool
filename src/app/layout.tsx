import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Developer Tools - Clean & Reliable Online Tools",
  description: "A clean, ad-free platform with essential developer tools: URL shortener, QR code generator, JSON formatter, Base64 encoder/decoder and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
