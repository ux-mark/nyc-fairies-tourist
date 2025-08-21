"use client";
import React, { useState } from "react";
import type { Attraction } from "../lib/attractions";
import { useAuth } from "../lib/auth-context";
import { updateAttraction, approveAttraction, deleteAttraction } from "../lib/attractions";
import { useSchedule } from "../lib/schedule-context";

interface EditableAttractionCardProps {
  attraction: Attraction;
  onUpdate?: () => void;
}

export default function EditableAttractionCard({ attraction, onUpdate }: EditableAttractionCardProps) {
  const { user, isAdmin, canEditAttraction, canDelete } = useAuth();
  const { days, activeDayIndex, addToActiveDay } = useSchedule();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(attraction);
  const [loading, setLoading] = useState(false);

  const canEdit = canEditAttraction(attraction);
  const alreadyAdded = days[activeDayIndex]?.items.some((item) => item.id === attraction.id) ?? false;

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
  const result = await updateAttraction(attraction.id, editData);
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
  const result = await approveAttraction(attraction.id);
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
  const result = await deleteAttraction(attraction.id);
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
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block ml-1" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m5-3h-5m5 0v5m0-5L10 14" /></svg>
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
            {canEdit && !isEditing && (
              <button
                className="px-3 py-1 rounded bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  className="px-3 py-1 rounded bg-success text-success-foreground border border-success hover:bg-success/80"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 rounded bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                  onClick={() => { setIsEditing(false); setEditData(attraction); }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
            {isAdmin && attraction.status === 'pending' && (
              <button
                className="px-3 py-1 rounded bg-yellow-400 text-yellow-900 border border-yellow-400 hover:bg-yellow-300"
                onClick={handleApprove}
                disabled={loading}
              >
                Approve
              </button>
            )}
            {canDelete(attraction) && (
              <button
                className="px-3 py-1 rounded bg-destructive text-destructive-foreground border border-destructive hover:bg-destructive/80"
                onClick={handleDelete}
                disabled={loading}
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
