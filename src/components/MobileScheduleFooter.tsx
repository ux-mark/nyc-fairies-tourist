import React from "react";
import { useSchedule } from "../lib/schedule-context";

export default function MobileScheduleFooter() {
  const {
    days,
    activeDayIndex,
    setActiveDay,
    removeFromDay,
    startDate,
    endDate,
  } = useSchedule();

  // Format date for display
  const formatDay = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  // If no date range, show button to scroll to TripSchedule
  if (!startDate || !endDate) {
    const handleScroll = () => {
      const el = document.getElementById("trip-schedule-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    return (
      <footer className="fixed bottom-0 left-0 w-full max-h-32 bg-card border-t border-border shadow-lg z-50 flex items-center justify-center pt-4 pb-2">
        <button
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={handleScroll}
        >
          Select Trip Dates
        </button>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full max-h-48 overflow-y-auto bg-card border-t border-border shadow-lg z-50">
      <div className="p-2 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-center mb-2">Your Schedule</h3>
        {days.map((day, i) => (
          <div
            key={day.date}
            className={`rounded-lg p-2 flex flex-col gap-1 ${activeDayIndex === i ? "border-primary bg-primary/10" : "bg-muted"}`}
          >
            <button
              className={`w-full text-left font-medium px-2 py-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${activeDayIndex === i ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              onClick={() => setActiveDay(i)}
              aria-current={activeDayIndex === i ? "date" : undefined}
            >
              {formatDay(day.date)}
            </button>
            <div className="flex flex-wrap gap-1">
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
          </div>
        ))}
      </div>
    </footer>
  );
}
