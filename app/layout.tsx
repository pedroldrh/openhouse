import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PinsProvider } from "@/lib/pins";
import "./globals.css";

const cereal = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-cereal",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OpenHouse — window-shop homes across US cities",
  description:
    "Pick a city, browse real-style homes with true monthly costs, and see what the same money buys somewhere else.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cereal.variable} antialiased`}>
        <PinsProvider>{children}</PinsProvider>
      </body>
    </html>
  );
}
