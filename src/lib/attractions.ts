import { supabase } from './supabase';

export type AttractionResource = {
  text: string;
  url: string;
};

export interface Attraction {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  price_range?: string;
  duration?: string;
  location: string;
  resources?: AttractionResource[];
  notes?: string;
  nearby_attractions?: string[];
  walking_distance?: string;
  venue_size?: string;
  todos?: string[];
  created_by?: string;
  status: 'pending' | 'approved';
  created_at?: string;
  updated_at?: string;
}
// Create new attraction (defaults to pending status)
export const createAttraction = async (
  attraction: Omit<Attraction, 'id' | 'created_at' | 'updated_at' | 'status'>,
  userId: string
): Promise<{ success: boolean; attraction?: Attraction; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('attractions')
      .insert({
        ...attraction,
        created_by: userId,
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    return { success: true, attraction: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create attraction'
    };
  }
};

// Update existing attraction
export const updateAttraction = async (
  id: string,
  updates: Partial<Attraction>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('attractions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update attraction'
    };
  }
};

// Get user's own attractions (both pending and approved)
export const getUserAttractions = async (userId: string): Promise<Attraction[]> => {
  try {
    const { data, error } = await supabase
      .from('attractions')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch user attractions:', error);
    return [];
  }
};

// Admin: Approve attraction
export const approveAttraction = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('attractions')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve attraction'
    };
  }
};

// Admin: Delete attraction (replaces reject)
export const deleteAttraction = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('attractions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete attraction'
    };
  }
};

// Get all unique tags from existing attractions
export const getAllTags = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('attractions')
      .select('tags')
      .not('tags', 'is', null);
    if (error) throw error;
    const allTags = new Set<string>();
    data?.forEach(attraction => {
      attraction.tags?.forEach((tag: string) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
};

// Get all attraction names for nearby_attractions dropdown
export const getAttractionNames = async (): Promise<{id: string, name: string}[]> => {
  try {
    const { data, error } = await supabase
      .from('attractions')
      .select('id, name')
      .eq('status', 'approved')
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch attraction names:', error);
    return [];
  }
};

// Add new category
export const addCategory = async (
  name: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('categories')
      .insert({ name: name.trim() });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add category'
    };
  }
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
