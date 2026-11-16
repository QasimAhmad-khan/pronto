import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Pronto — Your stay, at your fingertips",
  description: "Explore three hotel guides and try Pronto's hotel-specific service center demo.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#1854cf" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={inter.className}>{children}</body></html>;
}
