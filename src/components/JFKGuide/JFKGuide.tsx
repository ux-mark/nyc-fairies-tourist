
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageGallery from './ImageGallery';
import TransportOptions from './TransportOptions';
import SubwayMap from './SubwayMap';
import ProTips from './ProTips';


function Accordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl bg-card">
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        aria-expanded={open}
        aria-controls="gallery-steps"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Show step-by-step pictures</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div
          id="gallery-steps"
          className="px-2 pb-4"
          aria-hidden={!open}
        >
          <ImageGallery />
        </div>
      )}
    </div>
  );
}

export default function JFKGuide() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero and heading scroll with page */}
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 mt-8">Getting from JFK Airport to Manhattan: Complete Guide</h1>
        <h2 className="text-lg md:text-2xl text-muted-foreground mb-4">Your step-by-step journey from touchdown to the Fairies</h2>
         <Image
           src="/images/nyc-skyline.jpg"
           alt="NYC skyline"
           className="w-full h-56 object-cover rounded-xl"
           width={400}
           height={300}
         />
      </div>
      <section id="transport" className="container mx-auto px-4 mb-12">
        <TransportOptions />
      </section>
      <section id="gallery" className="container mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold mb-4">Airport to Penn by Pictures</h2>
        <Accordion />
      </section>
      <section id="subway" className="container mx-auto px-4 mb-12">
        <SubwayMap />
      </section>
      <section id="tips" className="container mx-auto px-4 mb-12">
        <ProTips />
      </section>
    </main>
  );
}
