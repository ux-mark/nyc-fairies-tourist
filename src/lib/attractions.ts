import attractionsData from '../data/attractions.json';

export type Attraction = {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  priceRange?: string;
  duration?: string;
  location?: string;
  resources?: string[];
  notes?: string;
  nearbyAttractions?: string[];
  walkingDistance?: string;
  venueSize?: string;
  todos?: string[];
};

export type AttractionsData = {
  categories: string[];
  attractions: Attraction[];
};

export const getAttractions = (): Attraction[] => {
  return (attractionsData as AttractionsData).attractions;
};

export const getCategories = (): string[] => {
  return (attractionsData as AttractionsData).categories;
};
