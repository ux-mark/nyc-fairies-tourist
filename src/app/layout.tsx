"// Removed 'use client' directive"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visit 🧚 the 🧚‍♀️ Fairies - in 🗽 NYC!",
  description: "Browse NYC attractions, filter by category, and build a day-by-day schedule.",
  metadataBase: new URL("https://visit.thefairies.ie"),
  openGraph: {
    title: "Visit 🧚 the 🧚‍♀️ Fairies - in 🗽 NYC!",
    description: "Browse NYC attractions, filter by category, and build a day-by-day schedule.",
    url: "https://visit.thefairies.ie",
    siteName: "NYC Tourist Info",
    images: [
      {
        url: "/public/globe.svg",
        width: 1200,
        height: 630,
        alt: "NYC Tourist Info logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit 🧚 the 🧚‍♀️ Fairies - in 🗽 NYC!",
    description: "Browse NYC attractions, filter by category, and build a day-by-day schedule.",
    images: ["/public/globe.svg"],
    site: "@nyctouristinfo",
  },
};



import ClientProviders from "./ClientProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
