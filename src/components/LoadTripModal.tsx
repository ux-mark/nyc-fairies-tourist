"use client"
import React, { useState } from 'react'
import { useSchedule } from '../lib/schedule-context'
import { useAuth } from '../lib/auth-context'
import { debugLog } from '../lib/utils';
import type { SavedTrip } from '../lib/trip-service'

interface LoadTripModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoadTripModal({ isOpen, onClose }: LoadTripModalProps) {
  React.useEffect(() => {
    debugLog('[LoadTripModal] Opened modal');
  }, []);
  // No email state needed
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getUserTrips, loadTrip } = useSchedule()
  const { user } = useAuth()

  // Helper to get user id
  const getUserId = (user: unknown) => {
    if (user && typeof user === 'object' && user !== null) {
      const u = user as { id?: string; user_id?: string };
      return u.id || u.user_id || null;
    }
    return null;
  };

  React.useEffect(() => {
    const userId = getUserId(user);
    if (userId) {
      debugLog('[LoadTripModal] Attempting to load trips', { user });
      setLoading(true);
      getUserTrips(userId)
        .then((trips) => {
          setTrips(trips);
          debugLog('[LoadTripModal] Loaded trips', trips);
        })
        .catch((err) => {
          setError('Failed to load trips.');
          debugLog('[LoadTripModal] Load failed', err);
        })
        .finally(() => setLoading(false));
    } else {
      setError('You must be logged in to load your trips.')
      debugLog('[LoadTripModal] Load failed: user not logged in', { user });
    }
  }, [user, getUserTrips])

  const handleLoadTrip = async (tripId: string) => {
    setLoading(true)
    setError('')
    debugLog('[LoadTripModal] Attempting to load trip', { user, tripId });
    try {
      const userId = getUserId(user);
      if (userId) {
        const success = await loadTrip(userId, tripId)
        if (success) {
          onClose()
          resetForm()
        } else {
          setError('Failed to load trip. Please try again.')
          debugLog('[LoadTripModal] LoadTrip failed', { user, tripId });
        }
      } else {
        setError('You must be logged in to load your trips.')
        debugLog('[LoadTripModal] LoadTrip failed: user not logged in', { user });
      }
    } catch {
      setError('Failed to load trip. Please try again.')
    }
    setLoading(false)
  }

  const resetForm = () => {
  setTrips([])
  setError('')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
        <h3 className="text-lg font-bold mb-4">Your Saved Trips</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        {trips.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">No saved trips found</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {trips.map((trip) => (
              <button
                key={trip.id}
                className="w-full border rounded-lg p-3 hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary text-left transition-colors disabled:opacity-50"
                onClick={() => handleLoadTrip(trip.id)}
                disabled={loading}
              >
                <div className="font-medium">{trip.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>{trip.attraction_count} attractions</span>
                  <span>Saved {formatDate(trip.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
