import React from "react";

export default function AboutSection() {
  return (
    <section id="about" className="my-12 max-w-2xl mx-auto p-6 bg-card rounded-xl shadow-lg border border-border">
      <h2 className="text-xl font-bold mb-4 text-center">About NYC Tourist Info</h2>
      <p className="text-muted-foreground mb-2">
        This site helps you plan your NYC adventure with curated attractions, easy filtering, and a trip schedule builder. Built with Next.js, Tailwind CSS, and Shadcn UI, it’s fast, modern, and mobile-friendly.
      </p>
      <ul className="list-disc list-inside text-sm text-foreground mb-2">
        <li>Browse and filter top NYC attractions</li>
        <li>Build your own trip schedule</li>
        <li>Enjoy a beautiful, responsive design</li>
        <li>Ready for static hosting and future database integration</li>
      </ul>
      <p className="text-xs text-muted-foreground text-center mt-4">
        &copy; {new Date().getFullYear()} NYC Tourist Info. All rights reserved.
      </p>
    </section>
  );
}
