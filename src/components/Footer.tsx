"use client";
import React from "react";

import { useAuth } from "../lib/auth-context";

export default function Footer() {
  const { user } = useAuth?.() ?? {};
  return (
    <footer className="w-full py-6 px-4 bg-muted text-muted-foreground border-t border-border mt-12 flex flex-col items-center shadow-inner">
      <div className="text-sm">&copy; {new Date().getFullYear()} Visit the  Fairies in NYC! 🧚‍♀️🗽🧚  Tourist Info. All rights reserved.</div>
      {!user && (
        <button
          className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => {
            const el = document.getElementById("trip-schedule-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            // Optionally trigger AuthModal if available globally
          }}
        >
          Log in to save and load your trip
        </button>
      )}
    </footer>
  );
}
