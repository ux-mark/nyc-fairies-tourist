
'use client';


import Link from 'next/link';
import { useState } from 'react';

function AccordionItem({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-card mb-4">
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div id={id} className="px-2 pb-4" aria-hidden={!open}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ESTAGuide() {
  return (
    <section aria-labelledby="esta-heading" className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6 shadow">
      <h2 id="esta-heading" className="text-2xl font-semibold mb-4 text-foreground">Visa Waiver Program (ESTA)</h2>
      <AccordionItem title="Who Needs ESTA?" id="who-needs-esta">
  <p>If you&apos;re travelling from <strong>any of the 43 Visa Waiver Program countries</strong>, you need ESTA authorisation before boarding your flight to the US.</p>
        <p className="mt-1 text-sm text-muted-foreground">VWP Countries Include: 🇮🇪 Ireland, 🇳🇿 New Zealand, 🇩🇪 Germany, 🇦🇺 Australia and <Link href="https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" className="underline text-primary hover:text-primary/80" target="_blank" rel="noopener">others</Link>.</p>
      </AccordionItem>
      <AccordionItem title="ESTA Application Process" id="esta-application-process">
        <ul className="list-disc ml-6 mb-2">
          <li><strong>Timing:</strong> Apply as soon as you book your flight – approval takes up to 72 hours, but most are approved instantly.</li>
          <li><strong>Cost:</strong> $21 total ($4 processing, $17 authorisation if approved)</li>
          <li><strong>Requirements:</strong> Valid e-passport, passport valid 6+ months, return/onward ticket, no prior US visa denials or serious criminal history</li>
        </ul>
        <p className="mt-2">🌐 <Link href="https://esta.cbp.dhs.gov/" className="underline text-primary hover:text-primary/80" target="_blank" rel="noopener">Official ESTA Application</Link></p>
        <p className="mt-2 text-destructive font-semibold">⚠️ Only use the official .gov website – avoid third-party sites that charge extra fees!</p>
      </AccordionItem>
    </section>
  );
}

// ...existing code...
