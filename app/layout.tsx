import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payment Tracker — Live Cost Ticker",
  description: "Real-time AI service payment tracker with live cost accumulation",
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
