
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

export default function MobileOptions() {
  return (
    <section aria-labelledby="mobile-heading" className="bg-success/5 border border-success/20 rounded-lg p-6 mb-6 shadow">
      <h2 id="mobile-heading" className="text-2xl font-semibold mb-2 text-foreground">Mobile Phone Plans</h2>
      <AccordionItem title="Option 1: eSIM Plans (Recommended)" id="option-esim">
        <ul className="list-disc ml-6 mb-2">
          <li>Check if your phone supports eSIM (iPhone XS/newer, most recent Android)</li>
          <li>Purchase eSIM plan online before travel</li>
          <li>Download and install (but don&apos;t activate until you land)</li>
          <li>Instant connectivity when you arrive</li>
        </ul>
        <h4 className="text-md font-semibold mt-2">Top eSIM Providers for USA:</h4>
        <ul className="list-disc ml-6 mb-2">
          <li><strong>Airalo</strong> – <Link href="https://www.airalo.com/" className="underline text-primary hover:text-primary/80" target="_blank" rel="noopener">Plans from $4.50</Link></li>
          <li><strong>Saily</strong> – Built-in VPN & Security</li>
          <li><strong>Holafly</strong> – Unlimited Data</li>
          <li><strong>T-Mobile Prepaid eSIM</strong> – <Link href="https://prepaid.t-mobile.com/esim-app" className="underline text-primary hover:text-primary/80" target="_blank" rel="noopener">US Carrier</Link></li>
        </ul>
      </AccordionItem>
      <AccordionItem title="Option 2: Physical SIM Cards" id="option-physical">
        <ul className="list-disc ml-6 mb-2">
          <li>Buy on Amazon, at JFK airport, or US stores (Best Buy, Target, carrier shops)</li>
          <li>Major US carriers: T-Mobile, Verizon, AT&T</li>
        </ul>
      </AccordionItem>
      <AccordionItem title="Option 3: International Roaming (Not Recommended)" id="option-roaming">
        <ul className="list-disc ml-6 mb-2">
          <li>Typical costs: $10-15/day for limited data, often throttled to 3G speeds</li>
          <li>Coverage may have gaps</li>
        </ul>
      </AccordionItem>
      <AccordionItem title="Mobile Payment Setup" id="option-payment">
        <ul className="list-disc ml-6 mb-2">
          <li><strong>Apple Pay/Google Pay</strong> – Accepted everywhere, including subway</li>
          <li><strong>MTA app</strong> – For subway schedules and alerts</li>
          <li><strong>MTA Train Times</strong> – For LIRR train from and to JFK (<Link href="/jfk-to-manhattan" className="underline text-primary hover:text-primary/80">see guide</Link>)</li>
        </ul>
      </AccordionItem>
    </section>
  );
}
