"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/auth-context";
import { getUserAttractions, Attraction } from "../lib/attractions";
import EditableAttractionCard from "./EditableAttractionCard";

export default function UserSubmissions() {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserAttractions = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserAttractions();
    }
  }, [user, loadUserAttractions]);

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
            <p className="text-muted-foreground mb-4">You haven&apos;t submitted any attractions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attractions.map((attraction) => (
              <EditableAttractionCard key={attraction.id} attraction={attraction} onUpdate={loadUserAttractions} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
