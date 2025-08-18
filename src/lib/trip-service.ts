import { supabase } from './supabase'
import type { ScheduleDay } from './schedule-context'
import type { Attraction } from './attractions'

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
  // No-op: setUserContext disabled for client-side
    
    // Create or get user record (upsert with conflict on phone_number)
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        { phone_number: phoneNumber, updated_at: new Date().toISOString() },
        { onConflict: 'phone_number' }
      )
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
  // No-op: setUserContext disabled for client-side
    
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

  return (data || []).map((trip: Record<string, any>) => ({
      id: trip.id as string,
      name: trip.name as string,
      start_date: trip.start_date as string,
      end_date: trip.end_date as string,
      created_at: trip.created_at as string,
      attraction_count: Array.isArray(trip.scheduled_attractions) && trip.scheduled_attractions.length > 0 ? (trip.scheduled_attractions[0].count as number) : 0
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
  schedule: Record<string, unknown>
  attractions: Attraction[]
  days: ScheduleDay[]
} | null> => {
  try {
  // No-op: setUserContext disabled for client-side
    
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
    
  attractions?.forEach((attr: any) => {
      if (!daysMap.has(attr.day_date)) {
        daysMap.set(attr.day_date, [])
      }
      // Create attraction object matching your existing structure
      const attraction: Attraction = {
        id: attr.attraction_id as string,
        name: attr.attraction_name as string,
        category: '',
        tags: [],
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
  // No-op: setUserContext disabled for client-side
    
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
  // No-op: setUserContext disabled for client-side
    
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
