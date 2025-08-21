import { supabase } from './supabase';

export type AttractionResource = {
  text: string;
  url: string;
};

export type Attraction = {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  price_range?: string;
  duration?: string;
  location?: string;
  resources?: AttractionResource[];
  notes?: string;
  nearby_attractions?: string[];
  walking_distance?: string;
  venue_size?: string;
  todos?: string[];
  created_at?: string;
};


export const getAttractions = async (): Promise<Attraction[]> => {
  const { data, error } = await supabase
    .from('attractions')
    .select('*');
  if (error) throw error;
  return data as Attraction[];
};

export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('name');
  if (error) throw error;
  return data ? data.map((cat: { name: string }) => cat.name) : [];
};
