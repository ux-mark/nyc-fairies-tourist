"use client"
import React, { useState } from 'react'
import { useSchedule } from '../lib/schedule-context'
import type { SavedTrip } from '../lib/trip-service'

interface LoadTripModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoadTripModal({ isOpen, onClose }: LoadTripModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'select'>('phone')
  const [error, setError] = useState('')
  
  const { getUserTrips, loadTrip } = useSchedule()

  const handleFindTrips = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const userTrips = await getUserTrips(phoneNumber.trim())
      setTrips(userTrips)
      setStep('select')
    } catch {
      setError('Failed to load trips. Please check your phone number and try again.')
    }
    
    setLoading(false)
  }

  const handleLoadTrip = async (tripId: string) => {
    setLoading(true)
    setError('')
    
    try {
      const success = await loadTrip(phoneNumber, tripId)
      if (success) {
        onClose()
        resetForm()
      } else {
        setError('Failed to load trip. Please try again.')
      }
    } catch {
      setError('Failed to load trip. Please try again.')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setStep('phone')
    setTrips([])
    setPhoneNumber('')
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
        {step === 'phone' ? (
          <form onSubmit={handleFindTrips}>
            <h3 className="text-lg font-bold mb-4">Load Your Trip</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="load-phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="load-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 rounded border border-border bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the phone number you used to save your trips.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !phoneNumber.trim()}
                className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {loading ? 'Finding...' : 'Find Trips'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Your Saved Trips</h3>
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {trips.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">No saved trips found</div>
                <p className="text-sm text-muted-foreground">
                  No trips found for this phone number. Make sure you're using the same number you used to save your trips.
                </p>
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
              {trips.length > 0 && (
                <button
                  onClick={() => setStep('phone')}
                  className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  disabled={loading}
                >
                  Different Number
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
