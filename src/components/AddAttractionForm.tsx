"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { createAttraction, getCategories, getAllTags, getAttractionNames, addCategory } from "../lib/attractions";
import type { Attraction } from "../lib/attractions";

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

  const validateAttraction = (attraction: Partial<Attraction>) => {
    const errors: string[] = [];
    if (!attraction.name?.trim()) errors.push('Name is required');
    if (!attraction.category?.trim()) errors.push('Category is required');
    if (!attraction.location?.trim()) errors.push('Location is required');
    if (attraction.resources?.some(r => (!r.url && r.text) || (r.url && !r.text))) {
      errors.push('Resources must have both URL and text');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const errors = validateAttraction(formData);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
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
  const result = await addCategory(newCategory.trim());
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
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="px-2 py-1 rounded border border-border bg-muted"
                />
                <button type="button" onClick={addNewCategory} className="px-2 py-1 rounded bg-primary text-primary-foreground font-semibold">Add</button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-2 py-1 rounded border border-border bg-muted"
              required
            />
          </div>
          {/* Optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price Range</label>
              <input
                type="text"
                value={formData.price_range}
                onChange={e => setFormData({ ...formData, price_range: e.target.value })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nearby Attractions</label>
              <select
                multiple
                value={formData.nearby_attractions}
                onChange={e => setFormData({ ...formData, nearby_attractions: Array.from(e.target.selectedOptions, opt => opt.value) })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
              >
                {attractionNames.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Venue Size</label>
              <input
                type="text"
                value={formData.venue_size}
                onChange={e => setFormData({ ...formData, venue_size: e.target.value })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Walking Distance</label>
              <input
                type="text"
                value={formData.walking_distance}
                onChange={e => setFormData({ ...formData, walking_distance: e.target.value })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Todos</label>
              <input
                type="text"
                value={formData.todos?.join(', ')}
                onChange={e => setFormData({ ...formData, todos: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full px-2 py-1 rounded border border-border bg-muted"
                placeholder="Comma separated"
              />
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map(tag => (
                <span key={tag} className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                  {tag}
                  <button type="button" className="ml-1 text-destructive" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="px-2 py-1 rounded border border-border bg-muted"
              />
              <button type="button" onClick={addTag} className="px-2 py-1 rounded bg-primary text-primary-foreground font-semibold">Add</button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Suggestions: {availableTags.join(', ')}</div>
          </div>
          {/* Resources */}
          <div>
            <label className="block text-sm font-medium mb-1">Resources</label>
            <button type="button" onClick={addResource} className="px-2 py-1 rounded bg-muted text-muted-foreground border border-border">+ Add Resource</button>
            {formData.resources?.map((resource, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={resource.text}
                  onChange={e => updateResource(idx, 'text', e.target.value)}
                  placeholder="Description"
                  className="px-2 py-1 rounded border border-border bg-muted"
                  required={!!resource.url}
                />
                <input
                  type="text"
                  value={resource.url}
                  onChange={e => updateResource(idx, 'url', e.target.value)}
                  placeholder="URL"
                  className="px-2 py-1 rounded border border-border bg-muted"
                  required={!!resource.text}
                />
                <button type="button" onClick={() => removeResource(idx)} className="px-2 py-1 rounded bg-destructive text-destructive-foreground border border-destructive">Remove</button>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-2 py-1 rounded border border-border bg-muted"
              rows={2}
            />
          </div>
          {/* Submit buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
              disabled={loading}
            >
              Submit
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground border border-border"
              onClick={() => { setIsOpen(false); resetForm(); }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
