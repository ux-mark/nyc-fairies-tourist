# NYC Tourist App: Trip Saving Feature Implementation Guide

## Project Context

### What You're Building
You're enhancing an existing NYC tourist planning web application with persistent trip saving functionality. The app currently allows users to:
- Browse NYC attractions with filtering and search
- Build day-by-day trip schedules by adding attractions
- View their schedule in a responsive interface

### The Problem You're Solving
**Current limitation:** Users lose their carefully planned itineraries when they close the browser or switch devices. There's no way to save, share, or return to a planned trip.

**User pain points:**
- Spending 30+ minutes planning a trip only to lose it
- Unable to share itineraries with travel companions
- Can't access plans on mobile while actually in NYC
- No way to save multiple trip options to compare

### The Solution
Implement a simple, privacy-focused trip saving system that:
- Requires only a phone number (no account creation)
- Saves trip data to persistent cloud storage
- Allows loading trips on any device
- Provides complete data deletion control
- Works seamlessly with existing trip planning flow

### Business Value
- **User retention:** Visitors return to refine and use saved trips
- **Reduced abandonment:** No fear of losing work encourages longer planning sessions
- **Mobile usage:** Saved trips accessible during actual NYC visits
- **Word of mouth:** Easy trip sharing increases organic growth

### Success Metrics
- % of users who save at least one trip
- Average number of attractions per saved trip
- Return visit rate for users with saved trips
- Mobile usage of saved trips during actual travel

## Technical Context

### Current Architecture
- **Frontend:** Next.js 15.4 with React 19, TypeScript
- **Styling:** Tailwind CSS v4.1 with custom theme
- **State:** React Context for trip schedule management
- **Data:** Static JSON file for attractions (`src/data/attractions.json`)
- **Deployment:** Vercel with GitHub integration
- **Current storage:** localStorage only (lost on device change)

### Existing Data Structure
```typescript
// Current trip data structure in schedule-context.tsx
type ScheduleDay = {
  date: string;           // "2025-08-17"
  items: Attraction[];    // Array of selected attractions
}

type Attraction = {
  id: string;            // "broadway-theatre"
  name: string;          // "Broadway Theatre"
  category: string;      // "Entertainment & Shows"
  tags?: string[];       // ["theatre", "indoor", "expensive"]
  priceRange?: string;   // "$120-200"
  duration?: string;     // "2.5-3 hours"
  location?: string;     // "Theatre District, Midtown Manhattan"
  // ... other optional fields
}
```

### File Structure Context
```
src/
├── app/
│   ├── layout.tsx              # Root layout with ScheduleProvider
│   └── page.tsx                # Main page with AttractionsList + TripSchedule
├── components/
│   ├── AttractionsList.tsx     # Grid of attraction cards with filters
│   ├── AttractionCard.tsx      # Individual attraction with "Add to Schedule"
│   ├── TripSchedule.tsx        # Sidebar showing planned days
│   ├── MobileScheduleFooter.tsx # Mobile-specific schedule view
│   └── CategoryFilter.tsx      # Filter buttons for attraction types
├── lib/
│   ├── schedule-context.tsx    # React Context managing trip state
│   ├── attractions.ts          # Functions to load attractions from JSON
│   └── useIsMobile.ts         # Hook for responsive behavior
└── data/
    └── attractions.json        # Static attraction database
```

## User Experience Requirements

### Core UX Principles
1. **Invisible until needed:** Don't change existing happy path
2. **One-click save:** Immediate value with minimal friction
3. **Clear data ownership:** Users understand and control their data
4. **Cross-device continuity:** Same experience phone to desktop
5. **Privacy by design:** Minimal data collection, easy deletion

### User Journeys

#### Primary Journey: Save Trip
```
1. User spends time building perfect 3-day NYC itinerary
2. Sees "Save Trip" button in trip schedule sidebar
3. Clicks → Modal opens asking for:
   - Trip name (pre-filled: "My NYC Trip")
   - Phone number (with privacy explanation)
4. Submits → Immediate success feedback
5. Gets clear instruction: "Use this phone number to load your trip on any device"
```

#### Secondary Journey: Load Trip
```
1. User opens app on different device (or returns later)
2. Sees "Load Trip" button in trip schedule
3. Enters phone number → System finds their saved trips
4. Shows list with trip names and dates
5. Clicks trip → Schedule immediately populates
6. Can continue planning or view on mobile while traveling
```

#### Critical Journey: Delete Data
```
1. User wants to remove their data completely
2. Clear "Delete My Data" option always visible
3. One-click deletion with confirmation
4. All associated data permanently removed
5. Clear confirmation of deletion
```

### Mobile-First Considerations
- **Touch targets:** Minimum 44px for all interactive elements
- **Modal sizing:** Full-screen on small devices, centered on desktop
- **Input optimization:** `type="tel"` for phone numbers, proper keyboard
- **Offline handling:** Graceful degradation when network unavailable

## Implementation Plan

### Phase 1: Database Foundation (30 minutes)

#### 1.1 Supabase Schema Setup
Since you've already created the `nyc-tourist-trips` database, execute this SQL in the Supabase SQL Editor:

```sql
-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table: Minimal user identification
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip schedules: High-level trip information
CREATE TABLE trip_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My NYC Trip',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled attractions: Individual attraction assignments to days
CREATE TABLE scheduled_attractions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  schedule_id UUID REFERENCES trip_schedules(id) ON DELETE CASCADE,
  attraction_id TEXT NOT NULL,     -- Links to attractions.json
  attraction_name TEXT NOT NULL,   -- Cached for performance
  day_date DATE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_schedules_user ON trip_schedules(user_id);
CREATE INDEX idx_attractions_schedule ON scheduled_attractions(schedule_id);
CREATE INDEX idx_attractions_date ON scheduled_attractions(day_date);

-- Row Level Security (RLS) for privacy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_attractions ENABLE ROW LEVEL SECURITY;

-- Security policies: Users can only access their own data
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL USING (phone_number = current_setting('app.user_phone', true));

CREATE POLICY "Users can manage own schedules" ON trip_schedules
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE phone_number = current_setting('app.user_phone', true)
  ));

CREATE POLICY "Users can manage own attractions" ON scheduled_attractions
  FOR ALL USING (schedule_id IN (
    SELECT ts.id FROM trip_schedules ts
    JOIN users u ON ts.user_id = u.id
    WHERE u.phone_number = current_setting('app.user_phone', true)
  ));
```

#### 1.2 Environment Configuration
Add to your `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Add your database password here if needed for direct connections
DATABASE_PASSWORD=your-database-password
```

**Important:** Add `.env.local` to your `.gitignore` if not already there.

### Phase 2: Core Services (45 minutes)

#### 2.1 Install Dependencies
```bash
npm install @supabase/supabase-js
```

#### 2.2 Supabase Client Setup
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Set user context for Row Level Security
export const setUserContext = async (phoneNumber: string) => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.user_phone',
      setting_value: phoneNumber,
      is_local: true
    })
  } catch (error) {
    console.error('Failed to set user context:', error)
  }
}
```

#### 2.3 Trip Service Layer
Create `src/lib/trip-service.ts`:
```typescript
import { supabase, setUserContext } from './supabase'
import type { ScheduleDay, Attraction } from './schedule-context'

export interface SavedTrip {
  id: string
  name: string
  start_date: string
  end_date: string
  created_at: string
  attraction_count?: number
}

export interface SaveTripResult {
  success: boolean
  tripId?: string
  error?: string
}

/**
 * Save a complete trip itinerary for a user
 */
export const saveTrip = async (
  phoneNumber: string,
  tripName: string,
  startDate: string,
  endDate: string,
  days: ScheduleDay[]
): Promise<SaveTripResult> => {
  try {
    // Set security context
    await setUserContext(phoneNumber)
    
    // Create or get user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({ 
        phone_number: phoneNumber,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return { success: false, error: 'Failed to create user record' }
    }

    // Create trip schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('trip_schedules')
      .insert({
        user_id: user.id,
        name: tripName.trim() || 'My NYC Trip',
        start_date: startDate,
        end_date: endDate
      })
      .select()
      .single()

    if (scheduleError) {
      console.error('Schedule creation error:', scheduleError)
      return { success: false, error: 'Failed to save trip schedule' }
    }

    // Prepare attractions data
    const attractions = days.flatMap(day =>
      day.items.map(item => ({
        schedule_id: schedule.id,
        attraction_id: item.id,
        attraction_name: item.name,
        day_date: day.date
      }))
    )

    // Save attractions if any exist
    if (attractions.length > 0) {
      const { error: attractionsError } = await supabase
        .from('scheduled_attractions')
        .insert(attractions)

      if (attractionsError) {
        console.error('Attractions save error:', attractionsError)
        // Try to clean up the schedule record
        await supabase.from('trip_schedules').delete().eq('id', schedule.id)
        return { success: false, error: 'Failed to save trip attractions' }
      }
    }

    return { success: true, tripId: schedule.id }
  } catch (error) {
    console.error('Save trip error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Get all saved trips for a user
 */
export const loadUserTrips = async (phoneNumber: string): Promise<SavedTrip[]> => {
  try {
    await setUserContext(phoneNumber)
    
    const { data, error } = await supabase
      .from('trip_schedules')
      .select(`
        id,
        name,
        start_date,
        end_date,
        created_at,
        scheduled_attractions(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Load trips error:', error)
      return []
    }

    return (data || []).map(trip => ({
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      created_at: trip.created_at,
      attraction_count: trip.scheduled_attractions?.[0]?.count || 0
    }))
  } catch (error) {
    console.error('Load user trips error:', error)
    return []
  }
}

/**
 * Load complete trip details including all attractions
 */
export const loadTripDetails = async (
  tripId: string, 
  phoneNumber: string
): Promise<{
  schedule: any
  attractions: any[]
  days: ScheduleDay[]
} | null> => {
  try {
    await setUserContext(phoneNumber)
    
    // Get trip schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('trip_schedules')
      .select('*')
      .eq('id', tripId)
      .eq('is_active', true)
      .single()

    if (scheduleError || !schedule) {
      console.error('Schedule load error:', scheduleError)
      return null
    }

    // Get attractions
    const { data: attractions, error: attractionsError } = await supabase
      .from('scheduled_attractions')
      .select('*')
      .eq('schedule_id', tripId)
      .order('day_date', { ascending: true })

    if (attractionsError) {
      console.error('Attractions load error:', attractionsError)
      return null
    }

    // Reconstruct days array matching your existing format
    const daysMap = new Map<string, Attraction[]>()
    
    attractions?.forEach(attr => {
      if (!daysMap.has(attr.day_date)) {
        daysMap.set(attr.day_date, [])
      }
      
      // Create attraction object matching your existing structure
      const attraction: Attraction = {
        id: attr.attraction_id,
        name: attr.attraction_name,
        // Note: Other fields like category, tags, etc. should be loaded from attractions.json
        // using the attraction_id to maintain data consistency
        category: '', // Will be populated from attractions.json
        tags: [],     // Will be populated from attractions.json
      }
      
      daysMap.get(attr.day_date)!.push(attraction)
    })

    // Generate complete days array including empty days
    const startDate = new Date(schedule.start_date)
    const endDate = new Date(schedule.end_date)
    const days: ScheduleDay[] = []
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().slice(0, 10)
      days.push({
        date: dateString,
        items: daysMap.get(dateString) || []
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { schedule, attractions, days }
  } catch (error) {
    console.error('Load trip details error:', error)
    return null
  }
}

/**
 * Permanently delete all user data
 */
export const deleteUserData = async (phoneNumber: string): Promise<boolean> => {
  try {
    await setUserContext(phoneNumber)
    
    // Delete user record (CASCADE will handle related data)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('phone_number', phoneNumber)

    if (error) {
      console.error('Delete user data error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete user data error:', error)
    return false
  }
}

/**
 * Soft delete a specific trip
 */
export const deleteTripById = async (
  tripId: string, 
  phoneNumber: string
): Promise<boolean> => {
  try {
    await setUserContext(phoneNumber)
    
    const { error } = await supabase
      .from('trip_schedules')
      .update({ is_active: false })
      .eq('id', tripId)

    if (error) {
      console.error('Delete trip error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete trip error:', error)
    return false
  }
}
```

### Phase 3: Context Integration (30 minutes)

#### 3.1 Enhance Schedule Context
Update `src/lib/schedule-context.tsx` to include persistence:

```typescript
// Add these imports at the top
import { 
  saveTrip as saveTripToDb,
  loadUserTrips,
  loadTripDetails,
  deleteUserData as deleteUserDataFromDb,
  type SavedTrip,
  type SaveTripResult
} from './trip-service'
import { getAttractions } from './attractions'

// Add to your existing ScheduleActions type
export type ScheduleActions = {
  // ... existing actions
  saveTrip: (phoneNumber: string, tripName: string) => Promise<SaveTripResult>
  loadTrip: (phoneNumber: string, tripId: string) => Promise<boolean>
  getUserTrips: (phoneNumber: string) => Promise<SavedTrip[]>
  deleteUserData: (phoneNumber: string) => Promise<boolean>
}

// Add these implementations to your ScheduleProvider component
export function ScheduleProvider({ children }: { children: ReactNode }) {
  // ... existing state

  // New persistence methods
  const saveTrip = async (phoneNumber: string, tripName: string): Promise<SaveTripResult> => {
    if (!startDate || !endDate) {
      return { success: false, error: 'Please set trip dates first' }
    }
    
    if (days.every(day => day.items.length === 0)) {
      return { success: false, error: 'Please add some attractions to your trip first' }
    }
    
    return await saveTripToDb(phoneNumber, tripName, startDate, endDate, days)
  }

  const loadTrip = async (phoneNumber: string, tripId: string): Promise<boolean> => {
    try {
      const tripData = await loadTripDetails(tripId, phoneNumber)
      if (!tripData) return false
      
      // Get full attraction data from JSON to merge with saved data
      const allAttractions = getAttractions()
      const attractionMap = new Map(allAttractions.map(a => [a.id, a]))
      
      // Merge saved data with full attraction details
      const enrichedDays = tripData.days.map(day => ({
        ...day,
        items: day.items.map(item => {
          const fullAttraction = attractionMap.get(item.id)
          return fullAttraction || item // Fallback to saved data if attraction not found
        })
      }))
      
      // Update context state
      setStartDate(tripData.schedule.start_date)
      setEndDate(tripData.schedule.end_date)
      setDays(enrichedDays)
      setActiveDayIndex(0)
      
      return true
    } catch (error) {
      console.error('Failed to load trip:', error)
      return false
    }
  }

  const getUserTrips = async (phoneNumber: string): Promise<SavedTrip[]> => {
    return await loadUserTrips(phoneNumber)
  }

  const deleteUserData = async (phoneNumber: string): Promise<boolean> => {
    const success = await deleteUserDataFromDb(phoneNumber)
    if (success) {
      // Clear local state as well
      reset()
    }
    return success
  }

  // ... rest of existing ScheduleProvider implementation

  return (
    <ScheduleContext.Provider
      value={{ 
        // ... existing values
        saveTrip,
        loadTrip,
        getUserTrips,
        deleteUserData
      }}
    >
      {children}
    </ScheduleContext.Provider>
  )
}
```

### Phase 4: UI Components (60 minutes)

#### 4.1 Save Trip Modal
Create `src/components/SaveTripModal.tsx`:

```typescript
'use client'
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
```

#### 4.2 Load Trip Modal
Create `src/components/LoadTripModal.tsx`:

```typescript
'use client'
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
    } catch (err) {
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
    } catch (err) {
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
```

#### 4.3 Data Management Modal
Create `src/components/DataManagementModal.tsx`:

```typescript
'use client'
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
        setError('Failed to delete data. Please try again or contact the Fairies.')
      }
    } catch (err) {
      setError('Failed to delete data. Please try again or contact the Fairies.')
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
```

#### 4.4 Update TripSchedule Component
Update `src/components/TripSchedule.tsx` to include the new functionality:

```typescript
// Add to imports
import { useState } from 'react'
import SaveTripModal from './SaveTripModal'
import LoadTripModal from './LoadTripModal'
import DataManagementModal from './DataManagementModal'

// Add to component state (after existing state)
const [showSaveModal, setShowSaveModal] = useState(false)
const [showLoadModal, setShowLoadModal] = useState(false)
const [showDataModal, setShowDataModal] = useState(false)

// Replace the existing reset button section with:
<div className="space-y-2">
  <div className="flex gap-2">
    <button
      className="flex-1 text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
      onClick={() => setShowSaveModal(true)}
      disabled={days.length === 0 || days.every(day => day.items.length === 0)}
      title={days.length === 0 ? "Set trip dates first" : "Save your current trip"}
    >
      Save Trip
    </button>
    <button
      className="flex-1 text-xs px-3 py-1 rounded bg-muted text-muted-foreground border border-border hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      onClick={() => setShowLoadModal(true)}
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
      className="flex-1 text-xs px-3 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
      onClick={() => setShowDataModal(true)}
    >
      Delete My Data
    </button>
  </div>
</div>

// Add modals before the closing component tag
<SaveTripModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
<LoadTripModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} />
<DataManagementModal isOpen={showDataModal} onClose={() => setShowDataModal(false)} />
```

### Phase 5: Deployment Configuration (15 minutes)

#### 5.1 Vercel Environment Variables
In your Vercel Dashboard (project settings → Environment Variables):

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-from-supabase
```

#### 5.2 Test Build Configuration
Add to `package.json` scripts (if not already present):

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Phase 6: Testing & Validation (30 minutes)

#### 6.1 Local Testing Checklist
- [ ] Environment variables loaded correctly
- [ ] Supabase connection working
- [ ] Save trip flow works end-to-end
- [ ] Load trip flow works end-to-end
- [ ] Data deletion works correctly
- [ ] Mobile responsive design
- [ ] Error handling for network issues
- [ ] Form validation working

#### 6.2 Production Testing Checklist
- [ ] Vercel deployment successful
- [ ] Environment variables configured in Vercel
- [ ] Database connections work in production
- [ ] All modals responsive on mobile devices
- [ ] Save/load functionality works across devices
- [ ] Privacy controls function correctly

### Security & Privacy Considerations

#### Data Minimization
- Only store essential data: phone number, trip details
- No personal information beyond phone number
- No tracking or analytics on user behavior

#### User Control
- One-click complete data deletion
- Clear explanation of data use
- No data retention beyond user choice

#### Technical Security
- Row Level Security prevents cross-user data access
- Environment variables keep credentials secure
- HTTPS encryption for all data in transit
- Supabase handles all security infrastructure

## Success Metrics & Analytics

### User Engagement Metrics
- Save trip completion rate
- Load trip success rate
- Average attractions per saved trip
- Return visit rate for users with saved trips

### Technical Metrics
- API response times
- Error rates for save/load operations
- Database query performance
- Mobile vs desktop usage patterns

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Phone number verification for enhanced security
- Trip sharing via unique links
- Multiple trip comparison view
- Export trip to calendar apps

### Phase 3 Features
- Collaborative trip planning
- Real-time updates for shared trips
- Integration with booking platforms
- Personalized recommendations

This implementation provides a solid foundation for user data persistence while maintaining simplicity and privacy. The modular design allows for easy enhancement and scaling as your user base grows.