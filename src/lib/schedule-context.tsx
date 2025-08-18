"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Attraction } from "./attractions";
import {
  saveTrip as saveTripToDb,
  loadUserTrips,
  loadTripDetails,
  deleteUserData as deleteUserDataFromDb,
  type SavedTrip,
  type SaveTripResult
} from './trip-service';
import { getAttractions } from './attractions';

export type ScheduleDay = {
  date: string;
  items: Attraction[];
};

export type ScheduleState = {
  startDate: string | null;
  endDate: string | null;
  days: ScheduleDay[];
  activeDayIndex: number;
};

export type ScheduleActions = {
  setDateRange: (start: string | null, end: string | null) => void;
  setActiveDay: (i: number) => void;
  addToActiveDay: (a: Attraction) => void;
  removeFromDay: (i: number, id: string) => void;
  reset: () => void;
  saveTrip: (phoneNumber: string, tripName: string) => Promise<SaveTripResult>;
  loadTrip: (phoneNumber: string, tripId: string) => Promise<boolean>;
  getUserTrips: (phoneNumber: string) => Promise<SavedTrip[]>;
  deleteUserData: (phoneNumber: string) => Promise<boolean>;
};

const ScheduleContext = createContext<ScheduleState & ScheduleActions | undefined>(undefined);

function getDaysInRange(start: string | null, end: string | null): string[] {
  if (!start || !end) return [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) return [];
  const days: string[] = [];
    const d = new Date(startDate);
  while (d <= endDate) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const LOCAL_KEY = "nyc_schedule_v1";

export function ScheduleProvider({ children }: { children: ReactNode }) {
  // Trip persistence methods
  const saveTrip = async (phoneNumber: string, tripName: string): Promise<SaveTripResult> => {
    if (!startDate || !endDate) {
      return { success: false, error: 'Please set trip dates first' };
    }
    if (days.every(day => day.items.length === 0)) {
      return { success: false, error: 'Please add some attractions to your trip first' };
    }
    return await saveTripToDb(phoneNumber, tripName, startDate, endDate, days);
  };

  const loadTrip = async (phoneNumber: string, tripId: string): Promise<boolean> => {
    try {
      const tripData = await loadTripDetails(tripId);
      if (!tripData) return false;
      const allAttractions = getAttractions();
      const attractionMap = new Map(allAttractions.map(a => [a.id, a]));
      const enrichedDays = tripData.days.map(day => ({
        ...day,
        items: day.items.map(item => attractionMap.get(item.id) || item)
      }));
  setStartDate(tripData.schedule.start_date as string);
  setEndDate(tripData.schedule.end_date as string);
      setDays(enrichedDays);
      setActiveDayIndex(0);
      return true;
    } catch (error) {
      console.error('Failed to load trip:', error);
      return false;
    }
  };

  const getUserTrips = async (phoneNumber: string): Promise<SavedTrip[]> => {
    return await loadUserTrips(phoneNumber);
  };

  const deleteUserData = async (phoneNumber: string): Promise<boolean> => {
    const success = await deleteUserDataFromDb(phoneNumber);
    if (success) {
      reset();
    }
    return success;
  };
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setStartDate(parsed.startDate ?? null);
        setEndDate(parsed.endDate ?? null);
        setDays(parsed.days ?? []);
        setActiveDayIndex(parsed.activeDayIndex ?? 0);
      } catch {}
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ startDate, endDate, days, activeDayIndex })
    );
  }, [startDate, endDate, days, activeDayIndex]);

  const setDateRange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
    const range = getDaysInRange(start, end);
    setDays(range.map(date => ({ date, items: [] })));
    setActiveDayIndex(0);
  };

  const setActiveDay = (i: number) => {
    setActiveDayIndex(i);
  };

  const addToActiveDay = (a: Attraction) => {
    setDays(prev => {
      if (activeDayIndex < 0 || activeDayIndex >= prev.length) return prev;
      const day = prev[activeDayIndex];
      if (day.items.some(item => item.id === a.id)) return prev;
      const newDay = { ...day, items: [...day.items, a] };
      return prev.map((d, idx) => (idx === activeDayIndex ? newDay : d));
    });
  };

  const removeFromDay = (i: number, id: string) => {
    setDays(prev => {
      if (i < 0 || i >= prev.length) return prev;
      const day = prev[i];
      const newDay = { ...day, items: day.items.filter(item => item.id !== id) };
      return prev.map((d, idx) => (idx === i ? newDay : d));
    });
  };

  const reset = () => {
    setStartDate(null);
    setEndDate(null);
    setDays([]);
    setActiveDayIndex(0);
  };

  return (
    <ScheduleContext.Provider
      value={{
        startDate,
        endDate,
        days,
        activeDayIndex,
        setDateRange,
        setActiveDay,
        addToActiveDay,
        removeFromDay,
        reset,
        saveTrip,
        loadTrip,
        getUserTrips,
        deleteUserData
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}
