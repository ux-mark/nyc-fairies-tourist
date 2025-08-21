"use client";
import React from "react";
import { AuthProvider } from "../lib/auth-context";
import { ScheduleProvider } from "../lib/schedule-context";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <Header />
        {children}
        <Footer />
      </ScheduleProvider>
    </AuthProvider>
  );
}
