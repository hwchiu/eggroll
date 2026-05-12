import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eggroll Financial Monitoring Dashboard",
  description:
    "Monitoring platform for 2026 Q2 earnings events, financial reports, and segment report readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
