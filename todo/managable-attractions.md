# GitHub Copilot Implementation Guide: Inline Attraction Editing

## Overview
Build inline editing functionality for attractions with role-based permissions. Users can add/edit their own attractions (pending approval), while admins can edit/approve all attractions using the same interface with additional controls.

## Database Schema (Already Implemented)
Your database is configured with:
- `users` table: `user_id` (UUID), `email`, `role` ('user'|'admin')
- `attractions` table: `created_by` (UUID → users.user_id), `status` ('pending'|'approved')
- RLS policies: Users see approved + own pending, Admins see all

## Updated TypeScript Interfaces

```typescript
// Update src/lib/attractions.ts
export interface Attraction {
  id: string;                    // Auto-generated
  name: string;                  // REQUIRED
  category: string;              // REQUIRED - dropdown from categories
  tags?: string[];               // OPTIONAL - select existing + add new
  price_range?: string;          // OPTIONAL
  duration?: string;             // OPTIONAL
  location: string;              // REQUIRED
  resources?: AttractionResource[]; // OPTIONAL - if provided, both url+text required
  notes?: string;                // OPTIONAL
  nearby_attractions?: string[]; // OPTIONAL - select from existing attractions
  walking_distance?: string;     // OPTIONAL
  venue_size?: string;           // OPTIONAL
  todos?: string[];              // OPTIONAL
  created_by?: string;           // UUID of user who created
  status: 'pending' | 'approved'; // No rejected - rejected items are deleted
  created_at?: string;           // Auto-generated
  updated_at?: string;           // Auto-generated
}

// Update User interface in auth-context.tsx
interface User {
  user_id: string;      // Supabase auth ID
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}
```

## Service Layer Implementation

### Update `src/lib/attractions.ts`

Add these functions to your existing attractions service:

```typescript
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
  updates: Partial<Attraction>,
  userId: string
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
  id: string,
  adminId: string
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
  id: string,
  adminId: string
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
  name: string,
  userId: string
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
```

## Auth Context Updates

### Update `src/lib/auth-context.tsx`

Add role checking utilities to your existing auth context:

```typescript
interface AuthContextType {
  user: User | null;
  session: unknown;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  canEditAttraction: (attraction: Attraction) => boolean;
  canApprove: boolean;
  canDelete: (attraction: Attraction) => boolean;
}

// Add these helper functions inside your AuthProvider component
const isAdmin = user?.role === 'admin';

const canEditAttraction = (attraction: Attraction) => {
  if (!user) return false;
  return isAdmin || attraction.created_by === user.user_id;
};

const canApprove = isAdmin;

const canDelete = (attraction: Attraction) => {
  if (!user) return false;
  return isAdmin || (attraction.created_by === user.user_id && attraction.status === 'pending');
};

// Add these to your context value
return (
  <AuthContext.Provider
    value={{
      user,
      session,
      loading,
      signOut,
      isAdmin,
      canEditAttraction,
      canApprove,
      canDelete
    }}
  >
    {children}
  </AuthContext.Provider>
);
```

## Component Implementation

### 1. Create `src/components/EditableAttractionCard.tsx`

Replace your current `AttractionCard` with this enhanced version:

```typescript
"use client";
import React, { useState } from "react";
import type { Attraction } from "../lib/attractions";
import { useAuth } from "../lib/auth-context";
import { updateAttraction, approveAttraction, deleteAttraction } from "../lib/attractions";
import { useSchedule } from "../lib/schedule-context";

interface EditableAttractionCardProps {
  attraction: Attraction;
  onUpdate?: () => void; // Callback to refresh data
}

export default function EditableAttractionCard({ 
  attraction, 
  onUpdate 
}: EditableAttractionCardProps) {
  const { user, isAdmin, canEditAttraction, canApprove, canDelete } = useAuth();
  const { days, activeDayIndex, addToActiveDay } = useSchedule();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(attraction);
  const [loading, setLoading] = useState(false);
  
  const canEdit = canEditAttraction(attraction);
  const alreadyAdded = days[activeDayIndex]?.items.some((item) => item.id === attraction.id) ?? false;
  
  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await updateAttraction(attraction.id, editData, user.user_id);
    
    if (result.success) {
      setIsEditing(false);
      onUpdate?.();
    } else {
      alert(result.error || 'Failed to update attraction');
    }
    setLoading(false);
  };
  
  const handleApprove = async () => {
    if (!user || !isAdmin) return;
    
    setLoading(true);
    const result = await approveAttraction(attraction.id, user.user_id);
    
    if (result.success) {
      onUpdate?.();
    } else {
      alert(result.error || 'Failed to approve attraction');
    }
    setLoading(false);
  };
  
  const handleDelete = async () => {
    if (!user || !canDelete(attraction)) return;
    if (!confirm('Are you sure you want to delete this attraction?')) return;
    
    setLoading(true);
    const result = await deleteAttraction(attraction.id, user.user_id);
    
    if (result.success) {
      onUpdate?.();
    } else {
      alert(result.error || 'Failed to delete attraction');
    }
    setLoading(false);
  };

  return (
    <div className={`bg-card text-card-foreground rounded-xl shadow-lg p-5 flex flex-col gap-3 border transition-transform hover:scale-[1.03] hover:shadow-xl duration-150 ${
      isAdmin ? (attraction.status === 'approved' ? 'border-success' : 'border-yellow-400') : 'border-border'
    }`}>
      
      {/* Status indicator for admins */}
      {isAdmin && (
        <div className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${
          attraction.status === 'approved' 
            ? 'bg-success/10 text-success' 
            : 'bg-yellow-400/10 text-yellow-600'
        }`}>
          {attraction.status}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-block w-2 h-2 rounded-full bg-primary" />
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="text-lg font-bold tracking-tight bg-muted px-2 py-1 rounded border border-border"
            required
          />
        ) : (
          <h2 className="text-lg font-bold tracking-tight">{attraction.name}</h2>
        )}
      </div>
      
      <div className="text-xs font-semibold text-muted-foreground mb-2">{attraction.category}</div>
      
      {attraction.tags && (
        <div className="flex flex-wrap gap-1 mb-2">
          {attraction.tags.map((tag) => (
            <span key={tag} className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
              {tag}
            </span>
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
                className="text-primary underline text-xs hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary flex items-center gap-1"
                aria-label={`External resource: ${resource.text}`}
              >
                {resource.text}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block ml-1" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m5-3h-5m5 0v5m0-5L10 14" />
                </svg>
              </a>
            );
          })}
        </div>
      )}
      
      {attraction.notes && (
        <div className="text-xs italic text-muted-foreground mt-2">{attraction.notes}</div>
      )}
      
      {/* Action buttons */}
      <div className="mt-4 space-y-2">
        {/* Add to schedule button */}
        <button
          className={`w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
            alreadyAdded ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary/90'
          }`}
          onClick={() => !alreadyAdded && addToActiveDay(attraction)}
          disabled={alreadyAdded}
          aria-pressed={alreadyAdded}
        >
          {alreadyAdded ? "Added" : "Add to Schedule"}
        </button>
        
        {/* Edit/admin controls */}
        {(canEdit || isAdmin) && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
                className="flex-1 px-3 py-1 text-xs rounded bg-muted text-foreground hover:bg-primary/10 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
              </button>
            )}
            
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(attraction);
                }}
                className="flex-1 px-3 py-1 text-xs rounded bg-muted text-foreground hover:bg-muted/80"
              >
                Cancel
              </button>
            )}
            
            {isAdmin && attraction.status === 'pending' && (
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-3 py-1 text-xs rounded bg-success text-white hover:bg-success/90 disabled:opacity-50"
              >
                Approve
              </button>
            )}
            
            {canDelete(attraction) && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-3 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Create `src/components/AddAttractionForm.tsx`

```typescript
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { createAttraction, getCategories, getAllTags, getAttractionNames, addCategory } from "../lib/attractions";
import type { Attraction, AttractionResource } from "../lib/attractions";

interface AddAttractionFormProps {
  onSuccess?: () => void;
}

export default function AddAttractionForm({ onSuccess }: AddAttractionFormProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<Attraction>>({
    name: '',
    category: '',
    location: '',
    tags: [],
    price_range: '',
    duration: '',
    notes: '',
    nearby_attractions: [],
    walking_distance: '',
    venue_size: '',
    todos: [],
    resources: []
  });
  
  // Dropdown data
  const [categories, setCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [attractionNames, setAttractionNames] = useState<{id: string, name: string}[]>([]);
  
  // Form state
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);
  
  const loadFormData = async () => {
    const [cats, tags, names] = await Promise.all([
      getCategories(),
      getAllTags(),
      getAttractionNames()
    ]);
    setCategories(cats);
    setAvailableTags(tags);
    setAttractionNames(names);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.category || !formData.location) return;
    
    setLoading(true);
    const result = await createAttraction(formData as Omit<Attraction, 'id' | 'created_at' | 'updated_at' | 'status'>, user.user_id);
    
    if (result.success) {
      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } else {
      alert(result.error || 'Failed to create attraction');
    }
    setLoading(false);
  };
  
  const resetForm = () => {
    setFormData({
      name: '', category: '', location: '', tags: [], price_range: '',
      duration: '', notes: '', nearby_attractions: [], walking_distance: '',
      venue_size: '', todos: [], resources: []
    });
  };
  
  const addNewCategory = async () => {
    if (!newCategory.trim() || !user) return;
    
    const result = await addCategory(newCategory.trim(), user.user_id);
    if (result.success) {
      setCategories(prev => [...prev, newCategory.trim()].sort());
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
    } else {
      alert(result.error || 'Failed to add category');
    }
  };
  
  const addTag = () => {
    if (!newTag.trim() || formData.tags?.includes(newTag.trim())) return;
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    setNewTag('');
  };
  
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };
  
  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...(prev.resources || []), { text: '', url: '' }]
    }));
  };
  
  const updateResource = (index: number, field: 'text' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources?.map((resource, i) => 
        i === index ? { ...resource, [field]: value } : resource
      ) || []
    }));
  };
  
  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources?.filter((_, i) => i !== index) || []
    }));
  };

  if (!user) return null;

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-primary bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-colors"
        >
          + Add New Attraction
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold">Add New Attraction</h3>
          
          {/* Required fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-border bg-muted"
                placeholder="Attraction name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded border border-border bg-muted"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setNewCategory(prompt('New category name:') || '')}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Location <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 rounded border border-border bg-muted"
              placeholder="Location or address"
            />
          </div>
          
          {/* Optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price Range</label>
              <input
                type="text"
                value={formData.price_range}
                onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-border bg-muted"
                placeholder="e.g., $10-20, Free"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-border bg-muted"
                placeholder="e.g., 2-3 hours"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map(tag => (
                <span key={tag} className="bg-accent text-accent-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-xs">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 rounded border border-border bg-muted"
                placeholder="Add tag"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-primary text-primary-foreground rounded">
                Add
              </button>
            </div>
          </div>
          
          {/* Resources */}
          <div>
            <label className="block text-sm font-medium mb-1">Resources</label>
            {formData.resources?.map((resource, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Link text"
                  value={resource.text}
                  onChange={(e) => updateResource(index, 'text', e.target.value)}
                  className="px-3 py-2 rounded border border-border bg-muted"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL"
                    value={resource.url}
                    onChange={(e) => updateResource(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 rounded border border-border bg-muted"
                  />
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="px-3 py-2 bg-destructive text-destructive-foreground rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addResource}
              className="px-3 py-2 bg-muted text-foreground rounded text-sm"
            >
              + Add Resource
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded border border-border bg-muted"
              placeholder="Additional information"
            />
          </div>
          
          {/* Submit buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.category || !formData.location}
              className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Attraction'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

### 3. Update `src/components/AttractionsList.tsx`

Replace your existing component to use the new editable cards:

```typescript
"use client";
import React, { useState, useEffect } from "react";
import { getAttractions, type Attraction } from "../lib/attractions";
import EditableAttractionCard from "./EditableAttractionCard";
import AddAttractionForm from "./AddAttractionForm";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import { useAuth } from "../lib/auth-context";

export default function AttractionsList() {
  const { user } = useAuth();
  const [allAttractions, setAllAttractions] = useState<Attraction[]>([]);
  const [filtered, setFiltered] = useState<Attraction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttractions();
  }, [user]);

  const loadAttractions = async () => {
    setLoading(true);
    try {
      const data = await getAttractions();
      setAllAttractions(data);
      setFiltered(data);
    } catch (error) {
      console.error('Failed to load attractions:', error);
      setAllAttractions([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Add attraction form - only show if logged in */}
      {user && <AddAttractionForm onSuccess={loadAttractions} />}
      
      <CategoryFilter selected={selectedCategory} onSelect={handleCategory} />
      <SearchBar onSearch={handleSearch} />
      
      {loading ? (
        <div className="text-center py-8">Loading attractions...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((attraction: Attraction) => (
            <EditableAttractionCard 
              key={attraction.id} 
              attraction={attraction} 
              onUpdate={loadAttractions}
            />
          ))}
        </div>
      )}
    </>
  );
}
```

### 4. Create `src/components/UserSubmissions.tsx`

For users to manage their own attractions:

```typescript
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { getUserAttractions, type Attraction } from "../lib/attractions";
import EditableAttractionCard from "./EditableAttractionCard";

export default function UserSubmissions() {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserAttractions();
    }
  }, [user]);

  const loadUserAttractions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUserAttractions(user.user_id);
      setAttractions(data);
    } catch (error) {
      console.error('Failed to load user attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your submissions.</p>
      </div>
    );
  }

  const pendingCount = attractions.filter(a => a.status === 'pending').length;
  const approvedCount = attractions.filter(a => a.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Your Attractions</h2>
        
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{attractions.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{approvedCount}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading your attractions...</div>
        ) : attractions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't submitted any attractions yet.</p>
            <p className="text-sm text-muted-foreground">
              Go to the main page to add your first attraction!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attractions.map((attraction) => (
              <EditableAttractionCard
                key={attraction.id}
                attraction={attraction}
                onUpdate={loadUserAttractions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Navigation Updates

### Update `src/components/Header.tsx`

Add navigation to user submissions:

```typescript
// Add this to your existing navItems array
const navItems = [
  { name: "Attractions", href: "/" },
  { name: "Before NYC", href: "/pre-departure" },
  { name: "Getting here", href: "/jfk-to-manhattan" },
  // Add this new item for logged-in users
  ...(user ? [{ name: "My Attractions", href: "/my-attractions" }] : []),
];
```

### Create `src/app/my-attractions/page.tsx`

```typescript
import { Metadata } from 'next';
import UserSubmissions from '../../components/UserSubmissions';

export const metadata: Metadata = {
  title: 'My Attractions | Visit the Fairies in NYC! 🧚‍♀️🗽🧚',
  description: 'Manage your submitted attractions and view their approval status.',
};

export default function MyAttractionsPage() {
  return (
    <div className="font-sans min-h-screen p-4 pb-20 sm:p-8 lg:p-20">
      <div className="max-w-6xl mx-auto">
        <UserSubmissions />
      </div>
    </div>
  );
}
```

## Implementation Steps

### Phase 1: Foundation (Do This First)
1. **Update your `auth-context.tsx`** with the new helper functions
2. **Update `attractions.ts`** with all the new service functions
3. **Test the service functions** in your browser console to ensure they work

### Phase 2: Core Components
1. **Replace `AttractionCard.tsx`** with `EditableAttractionCard.tsx`
2. **Create `AddAttractionForm.tsx`** component
3. **Update `AttractionsList.tsx`** to use new components
4. **Test basic add/edit functionality**

### Phase 3: User Management
1. **Create `UserSubmissions.tsx`** component
2. **Add navigation route** for `/my-attractions`
3. **Create the page component**
4. **Test user workflow**: add → edit → view submissions

### Phase 4: Admin Testing
1. **Sign in as `who@thefairies.ie`**
2. **Run**: `UPDATE public.users SET role = 'admin' WHERE email = 'who@thefairies.ie';`
3. **Test admin functions**: approve, delete, edit any attraction
4. **Verify visual indicators** (green/yellow borders)

## Validation Rules

Implement these validation rules in your form components:

```typescript
const validateAttraction = (attraction: Partial<Attraction>) => {
  const errors: string[] = [];
  
  if (!attraction.name?.trim()) errors.push('Name is required');
  if (!attraction.category?.trim()) errors.push('Category is required');
  if (!attraction.location?.trim()) errors.push('Location is required');
  
  // Validate resources - if provided, both URL and text are required
  if (attraction.resources?.some(r => (!r.url && r.text) || (r.url && !r.text))) {
    errors.push('Resources must have both URL and text');
  }
  
  return errors;
};
```

## Testing Checklist

### Regular User Testing
- [ ] Can add new attraction (defaults to pending)
- [ ] Can edit own attractions
- [ ] Can delete own pending attractions
- [ ] Cannot see other users' pending attractions
- [ ] Cannot edit attractions they didn't create
- [ ] Can see approved attractions from all users

### Admin Testing
- [ ] Can see all attractions (pending + approved)
- [ ] Visual indicators show status (green/yellow borders)
- [ ] Can approve pending attractions
- [ ] Can edit any attraction
- [ ] Can delete any attraction
- [ ] Approved attractions become visible to all users

### Edge Cases
- [ ] Form validation works correctly
- [ ] Network errors are handled gracefully
- [ ] Permission checks work when not logged in
- [ ] Database constraints prevent invalid data

## Success Metrics

After implementation, you should see:
- **User Engagement**: Users actively submitting attractions
- **Quality Control**: Admins efficiently managing submissions
- **Content Growth**: Attraction database expanding with user contributions
- **No Permission Leaks**: Users only see/edit what they should

This implementation provides a solid foundation for user-generated content with proper admin oversight, following your exact requirements for pending/approved workflow and admin-only visual indicators.