import React from "react";


export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 bg-muted text-muted-foreground border-t border-border mt-12 flex flex-col items-center shadow-inner">
      <div className="text-sm">&copy; {new Date().getFullYear()} NYC with The Fairies Tourist Info. All rights reserved.</div>
      
    </footer>
  );
}
