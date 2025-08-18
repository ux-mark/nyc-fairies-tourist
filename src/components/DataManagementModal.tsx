"use client"
import React, { useState } from 'react'
import { useSchedule } from '../lib/schedule-context'

interface DataManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  
  const { deleteUserData } = useSchedule()

  const handleDeleteData = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const success = await deleteUserData(phoneNumber.trim())
      if (success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          resetForm()
        }, 3000)
      } else {
        setError('Failed to delete data. Please try again or contact support.')
      }
    } catch {
      setError('Failed to delete data. Please try again or contact support.')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setPhoneNumber('')
    setConfirmDelete(false)
    setSuccess(false)
    setError('')
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
            <h3 className="text-lg font-bold mb-2">Data Deleted Successfully</h3>
            <p className="text-muted-foreground">
              All your trips and personal data have been permanently removed from our servers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDeleteData}>
            <h3 className="text-lg font-bold mb-4 text-red-600">Delete My Data</h3>
            
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800 mb-2">
                <strong>Warning:</strong> This action cannot be undone.
              </p>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                <li>All your saved trips will be permanently deleted</li>
                <li>Your phone number will be removed from our system</li>
                <li>You won't be able to recover this data</li>
              </ul>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="delete-phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="delete-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 rounded border border-border bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your phone number to delete all associated data.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  id="confirm-delete"
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="rounded border-border"
                  required
                />
                <label htmlFor="confirm-delete" className="text-sm">
                  I understand this action cannot be undone
                </label>
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
                disabled={loading || !phoneNumber.trim() || !confirmDelete}
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
              >
                {loading ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
