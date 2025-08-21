
"use client";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import SaveTripModal from "./SaveTripModal";
import LoadTripModal from "./LoadTripModal";
import DataManagementModal from "./DataManagementModal";
import AuthModal from "./AuthModal";
import { useAuth } from "../lib/auth-context";
import { useSchedule } from "../lib/schedule-context";

export default function TripSchedule() {
  const {
    startDate,
    endDate,
    days,
    activeDayIndex,
    setDateRange,
    setActiveDay,
    removeFromDay,
    reset,
  } = useSchedule();
  const { user, loading } = useAuth();

  // Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | 'save' | 'load' | 'delete'>(null);

  // Format date for display (client-only)
  const [formattedDays, setFormattedDays] = useState<string[]>([]);
  useEffect(() => {
    setFormattedDays(
      days.map(day => {
        const d = new Date(day.date);
        return d.toLocaleDateString(undefined, {
          weekday: "long",
          day: "2-digit",
          month: "short",
        });
      })
    );
  }, [days]);

  // Ref for end date input
  const endDateRef = React.useRef<HTMLInputElement>(null);

  // When start date is selected, focus end date input
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(e.target.value, endDate);
    // Only focus and open calendar if a valid date is selected
    if (e.target.value && endDateRef.current) {
      endDateRef.current.focus();
      // Try to open the calendar popup
      endDateRef.current.click();
    }
  };

  // Auth check before actions
  const requireAuth = (action: 'save' | 'load' | 'delete') => {
    if (loading) return; // Wait for auth to load
    if (!user) {
      setPendingAction(action);
      setShowAuthModal(true);
    } else {
      if (action === 'save') setShowSaveModal(true);
      if (action === 'load') setShowLoadModal(true);
      if (action === 'delete') setShowDataModal(true);
    }
  };

  // After auth, continue pending action
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingAction === 'save') setShowSaveModal(true);
    if (pendingAction === 'load') setShowLoadModal(true);
    if (pendingAction === 'delete') setShowDataModal(true);
    setPendingAction(null);
  };

  return (
    <aside id="trip-schedule-section" className="w-full max-w-xs mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Trip Schedule</h2>
      <div className="flex flex-col gap-4 mb-4">
        {user ? (
          <>
            <div className="flex gap-2 items-center justify-center">
              <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
              <input
                id="start-date"
                type="date"
                className="px-2 py-1 rounded border border-border bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                value={startDate ?? ""}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="flex gap-2 items-center justify-center">
              <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
              <input
                id="end-date"
                type="date"
                className="px-2 py-1 rounded border border-border bg-muted text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                value={endDate ?? ""}
                onChange={e => setDateRange(startDate, e.target.value)}
                ref={endDateRef}
              />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  className="flex-1 text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                  onClick={() => requireAuth('save')}
                  disabled={days.length === 0 || days.every(day => day.items.length === 0)}
                  title={days.length === 0 ? "Set trip dates first" : "Save your current trip"}
                >
                  Save Trip
                </button>
                <button
                  className="flex-1 text-xs px-3 py-1 rounded bg-muted text-muted-foreground border border-border hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  onClick={() => requireAuth('load')}
                >
                  Load Trip
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 text-xs px-3 py-1 rounded bg-muted text-muted-foreground border border-border hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  onClick={reset}
                >
                  Reset Schedule
                </button>
                <button
                  className="flex-1 text-xs px-3 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive"
                  onClick={() => requireAuth('delete')}
                >
                  Delete My Data
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center py-8">
            <button
              className="w-full px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => setShowAuthModal(true)}
            >
              Log in to start planning, saving, and loading your trip
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {days.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">Set a date range to begin planning your trip.</div>
        ) : (
          days.map((day, i) => (
            <div
              key={day.date}
              className={`border rounded-xl p-4 shadow-sm flex flex-col gap-2 ${activeDayIndex === i ? "border-primary bg-primary/5" : "bg-card"}`}
            >
              <button
                className={`w-full text-left font-semibold mb-2 px-2 py-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${activeDayIndex === i ? "bg-primary-light text-primary-foreground" : "bg-muted text-foreground"}`}
                onClick={() => setActiveDay(i)}
                aria-current={activeDayIndex === i ? "date" : undefined}
              >
                {formattedDays[i] || day.date}
              </button>
              {day.items.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center">+ Add Attractions</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {day.items.map(item => (
                    <span key={item.id} className="flex items-center gap-1 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium">
                      {item.name}
                      <button
                        className="ml-1 text-xs px-1 rounded bg-accent text-accent-foreground hover:bg-accent/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                        onClick={() => removeFromDay(i, item.id)}
                        aria-label={`Remove ${item.name} from schedule`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
  </div>
      <SaveTripModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
      <LoadTripModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} />
      <DataManagementModal isOpen={showDataModal} onClose={() => setShowDataModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </aside>
  );
}
