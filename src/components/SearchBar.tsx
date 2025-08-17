"use client";
import React, { useState } from "react";


export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <form
      className="w-full max-w-md mx-auto mb-8 flex shadow-sm rounded-lg overflow-hidden border border-border bg-card"
      onSubmit={e => {
        e.preventDefault();
        onSearch(query);
      }}
      role="search"
      aria-label="Search attractions"
    >
      <label htmlFor="search-input" className="sr-only">Search attractions</label>
      <input
        id="search-input"
        type="search"
        enterKeyHint="search"
        placeholder="Search attractions..."
        className="flex-1 px-4 py-2 bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary border-none"
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search attractions"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        Search
      </button>
    </form>
  );
}
