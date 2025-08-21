
"use client";
import React from "react";
import type { Attraction } from "../lib/attractions";
import { useSchedule } from "../lib/schedule-context";


export default function AttractionCard({ attraction }: { attraction: Attraction }) {
  const { days, activeDayIndex, addToActiveDay } = useSchedule();
  const alreadyAdded =
    days[activeDayIndex]?.items.some((item) => item.id === attraction.id) ?? false;

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-lg p-5 flex flex-col gap-3 border border-border transition-transform hover:scale-[1.03] hover:shadow-xl duration-150">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-block w-2 h-2 rounded-full bg-primary" />
        <h2 className="text-lg font-bold tracking-tight">{attraction.name}</h2>
      </div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">{attraction.category}</div>
      {attraction.tags && (
        <div className="flex flex-wrap gap-1 mb-2">
          {attraction.tags.map((tag) => (
            <span key={tag} className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
         {attraction.price_range && <span>💲 {attraction.price_range}</span>}
        {attraction.duration && <span>⏱ {attraction.duration}</span>}
        {attraction.location && <span>📍 {attraction.location}</span>}
      </div>
      {attraction.resources && attraction.resources.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          {attraction.resources.map((resource, idx) => {
            const isExternal = /^https?:\/\//i.test(resource.url);
            const externalUrl = isExternal ? resource.url : `https://${resource.url.replace(/^\/*/, "")}`;
            return (
              <a
                key={resource.url + idx}
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-xs hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary flex items-center gap-1"
                aria-label={`External resource: ${resource.text}`}
              >
                {resource.text}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block ml-1" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m5-3h-5m5 0v5m0-5L10 14" /></svg>
              </a>
            );
          })}
        </div>
      )}
      {attraction.notes && (
        <div className="text-xs italic text-muted-foreground mt-2">{attraction.notes}</div>
      )}
      <button
        className={`mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${alreadyAdded ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
        onClick={() => !alreadyAdded && addToActiveDay(attraction)}
        disabled={alreadyAdded}
        aria-pressed={alreadyAdded}
      >
        {alreadyAdded ? "Added" : "Add to Schedule"}
      </button>
    </div>
  );
}
