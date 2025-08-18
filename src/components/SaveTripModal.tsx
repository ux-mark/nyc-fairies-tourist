"use client"
import React, { useState } from 'react'
import { useSchedule } from '../lib/schedule-context'

interface SaveTripModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SaveTripModal({ isOpen, onClose }: SaveTripModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [tripName, setTripName] = useState('My NYC Trip')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const { saveTrip, days } = useSchedule()

  // Count total attractions
  const totalAttractions = days.reduce((sum, day) => sum + day.items.length, 0)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Basic validation
    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      setLoading(false)
      return
    }
    
    const result = await saveTrip(phoneNumber.trim(), tripName.trim())
    
    if (result.success) {
      setSuccess(true)
      // Auto-close after success
      setTimeout(() => {
        onClose()
        resetForm()
      }, 2500)
    } else {
      setError(result.error || 'Failed to save trip. Please try again.')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setSuccess(false)
    setError('')
    setPhoneNumber('')
    setTripName('My NYC Trip')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
        {success ? (
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-bold mb-2">Trip Saved Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Your trip "{tripName}" with {totalAttractions} attractions has been saved.
            </p>
            <p className="text-sm text-muted-foreground">
              Use your phone number to load this trip on any device.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <h3 className="text-lg font-bold mb-4">Save Your Trip</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="trip-name" className="block text-sm font-medium mb-1">
                  Trip Name
                </label>
                <input
                  id="trip-name"
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  placeholder="My NYC Trip"
                  maxLength={100}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 rounded border border-border bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used only to save and retrieve your trips. No verification required. 
                  You can delete all your data at any time.
                </p>
              </div>

              <div className="bg-muted/50 p-3 rounded text-sm">
                <strong>Trip Summary:</strong>
                <div className="text-muted-foreground">
                  {totalAttractions} attractions planned
                </div>
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
                disabled={loading}
                className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {loading ? 'Saving...' : 'Save Trip'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
