import type { Metadata } from "next";
import Header from "../components/Header";
import ClientMobileFooter from "../components/ClientMobileFooter";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://nyc-tourist-info.example.com"),
  openGraph: {
    title: "Visit 🧚 the 🧚‍♀️ Fairies - in 🗽 NYC!",
    description: "Browse NYC attractions, filter by category, and build a day-by-day schedule.",
    url: "https://nyc-tourist-info.example.com",
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


import React from "react";
import Footer from "../components/Footer";
import { ScheduleProvider } from "../lib/schedule-context";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ScheduleProvider>
            <Header />
            {children}
            <ClientMobileFooter />
            <Footer />
          </ScheduleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
