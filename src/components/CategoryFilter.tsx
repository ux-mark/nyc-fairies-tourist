import React, { useEffect, useState } from "react";
import { getCategories } from "../lib/attractions";

export default function CategoryFilter({ selected, onSelect }: { selected: string | null; onSelect: (category: string | null) => void }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <nav aria-label="Filter by category" className="mb-6">
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          className={`px-4 py-1 rounded-full border border-border bg-muted text-foreground font-medium shadow-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selected === null ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
          onClick={() => onSelect(null)}
          aria-pressed={selected === null}
        >
          All
        </button>
        {loading ? (
          <span className="px-4 py-1 text-muted">Loading...</span>
        ) : (
          categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1 rounded-full border border-border bg-muted text-foreground font-medium shadow-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selected === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
              onClick={() => onSelect(cat)}
              aria-pressed={selected === cat}
            >
              {cat}
            </button>
          ))
        )}
      </div>
    </nav>
  );
}
