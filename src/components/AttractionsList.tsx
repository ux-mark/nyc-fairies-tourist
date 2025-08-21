"use client";
import React, { useState, useEffect } from "react";
import { getAttractions, Attraction } from "../lib/attractions";
import EditableAttractionCard from "./EditableAttractionCard";
import AddAttractionForm from "./AddAttractionForm";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";


export default function AttractionsList() {
  const [allAttractions, setAllAttractions] = useState<Attraction[]>([]);
  const [filtered, setFiltered] = useState<Attraction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAttractions = async () => {
    setLoading(true);
    try {
      const data = await getAttractions();
      setAllAttractions(data);
      setFiltered(data);
    } catch {
      setAllAttractions([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttractions();
  }, []);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    setFiltered(
      allAttractions.filter(
        (a: Attraction) =>
          (selectedCategory === null || a.category === selectedCategory) &&
          (a.name.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            (a.tags && a.tags.some((tag: string) => tag.toLowerCase().includes(q)))
          )
      )
    );
  };

  const handleCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    setFiltered(
      allAttractions.filter(
        (a: Attraction) =>
          (cat === null || a.category === cat)
      )
    );
  };

  return (
    <>
      <AddAttractionForm onSuccess={loadAttractions} />
      <CategoryFilter selected={selectedCategory} onSelect={handleCategory} />
      <SearchBar onSearch={handleSearch} />
      {loading ? (
        <div className="text-center py-8">Loading attractions...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((attraction: Attraction) => (
            <EditableAttractionCard key={attraction.id} attraction={attraction} onUpdate={loadAttractions} />
          ))}
        </div>
      )}
    </>
  );
}
