import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHR Card Duel Arena",
  description: "Pokemon vs Melody two-player card duel with persistent battle records",
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
