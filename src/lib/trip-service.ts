
import { supabase } from './supabase';
import { debugLog } from './utils';
import type { ScheduleDay } from './schedule-context';
import type { Attraction } from './attractions';

export interface SavedTrip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  attraction_count?: number;
}

export interface SaveTripResult {
  success: boolean;
  tripId?: string;
  error?: string;
}

export const saveTrip = async (
  user_id: string,
  tripName: string,
  startDate: string,
  endDate: string,
  days: ScheduleDay[]
): Promise<SaveTripResult> => {
  try {
    // Insert trip schedule with user_id
    debugLog('[saveTrip] Inserting trip schedule', { user_id, tripName, startDate, endDate });
    const { data: schedule, error: scheduleError } = await supabase
      .from('trip_schedules')
      .insert({
        user_id,
        name: tripName.trim() || 'My NYC Trip',
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();
    debugLog('[saveTrip] Insert result', { schedule, scheduleError });

    if (scheduleError) {
      console.error('Schedule creation error:', scheduleError);
      return { success: false, error: 'Failed to save trip schedule' };
    }

    const attractions = days.flatMap(day =>
      day.items.map(item => ({
        schedule_id: schedule.id,
        attraction_id: item.id,
        attraction_name: item.name,
        day_date: day.date,
      }))
    );

    if (attractions.length > 0) {
      debugLog('[saveTrip] Inserting scheduled attractions', attractions);
      const { error: attractionsError } = await supabase
        .from('scheduled_attractions')
        .insert(attractions);
      debugLog('[saveTrip] Attractions insert result', { attractionsError });
      if (attractionsError) {
        console.error('Attractions save error:', attractionsError);
  debugLog('[saveTrip] Deleting failed trip schedule', schedule.id);
  await supabase.from('trip_schedules').delete().eq('id', schedule.id);
        return { success: false, error: 'Failed to save trip attractions' };
      }
    }

    return { success: true, tripId: schedule.id };
  } catch (error) {
  debugLog('[saveTrip] Exception', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const loadUserTrips = async (user_id: string): Promise<SavedTrip[]> => {
  debugLog('[loadUserTrips] Loading trips for user', user_id);
  try {
    // Load trips for this user_id
    const { data, error } = await supabase
      .from('trip_schedules')
      .select('id, name, start_date, end_date, created_at, scheduled_attractions(count)')
      .eq('is_active', true)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
  debugLog('[loadUserTrips] Query result', { data, error });

    if (error) {
      console.error('Load trips error:', error);
      return [];
    }

    return (data || []).map((trip: SavedTrip & { scheduled_attractions?: { count: number }[] }) => ({
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      created_at: trip.created_at,
      attraction_count:
        Array.isArray(trip.scheduled_attractions) && trip.scheduled_attractions.length > 0
          ? trip.scheduled_attractions[0].count
          : 0,
    }));
  } catch (error) {
  debugLog('[loadUserTrips] Exception', error);
    return [];
  }
};

export const loadTripDetails = async (
  tripId: string
): Promise<{
  schedule: Record<string, unknown>;
  attractions: Attraction[];
  days: ScheduleDay[];
} | null> => {
  debugLog('[loadTripDetails] Loading trip details', tripId);
  try {
    const { data: schedule, error: scheduleError } = await supabase
      .from('trip_schedules')
      .select('*')
      .eq('id', tripId)
      .eq('is_active', true)
      .single();
  debugLog('[loadTripDetails] Schedule query result', { schedule, scheduleError });

    if (scheduleError || !schedule) {
      console.error('Schedule load error:', scheduleError);
      return null;
    }

    const { data: attractions, error: attractionsError } = await supabase
      .from('scheduled_attractions')
      .select('*')
      .eq('schedule_id', tripId)
      .order('day_date', { ascending: true });
  debugLog('[loadTripDetails] Attractions query result', { attractions, attractionsError });

    if (attractionsError) {
      console.error('Attractions load error:', attractionsError);
      return null;
    }

    const daysMap = new Map<string, Attraction[]>();
    (attractions || []).forEach(attr => {
      const a = attr as { day_date: string; attraction_id: string; attraction_name: string };
      if (!daysMap.has(a.day_date)) {
        daysMap.set(a.day_date, []);
      }
      const attraction: Attraction = {
        id: a.attraction_id,
        name: a.attraction_name,
        category: '',
        tags: [],
        location: '',
        status: 'approved',
      };
      daysMap.get(a.day_date)!.push(attraction);
    });

    const startDate = new Date(schedule.start_date as string);
    const endDate = new Date(schedule.end_date as string);
    const days: ScheduleDay[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().slice(0, 10);
      days.push({
        date: dateString,
        items: daysMap.get(dateString) || [],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { schedule, attractions: attractions || [], days };
  } catch (error) {
  debugLog('[loadTripDetails] Exception', error);
    return null;
  }
};

export const deleteUserData = async (user_id: string): Promise<boolean> => {
  debugLog('[deleteUserData] Deleting all user data', user_id);
  try {
    // Delete all trips associated with the user id
    const { data: tripDeleteData, error: tripError } = await supabase
      .from('trip_schedules')
      .delete()
      .eq('user_id', user_id);
  debugLog('[deleteUserData] Trip delete result', { tripDeleteData, tripError });

    console.log('[deleteUserData] Trip delete result:', { tripDeleteData, tripError, userId: user_id });

    if (tripError) {
      console.error('[deleteUserData] Delete user trips error:', tripError);
      return false;
    }

    // Delete user record
    const { data: userDeleteData, error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('user_id', user_id);
  debugLog('[deleteUserData] User delete result', { userDeleteData, userDeleteError });

    console.log('[deleteUserData] User delete result:', { userDeleteData, userDeleteError, userId: user_id });

    if (userDeleteError) {
      console.error('[deleteUserData] Delete user data error:', userDeleteError);
      return false;
    }
    return true;
  } catch (error) {
  debugLog('[deleteUserData] Exception', error);
    return false;
  }
};

export const deleteTripById = async (
  tripId: string
): Promise<boolean> => {
  debugLog('[deleteTripById] Deleting trip by id', tripId);
  try {
    const { error } = await supabase
      .from('trip_schedules')
      .update({ is_active: false })
      .eq('id', tripId);
  debugLog('[deleteTripById] Update result', { error });

    if (error) {
      console.error('Delete trip error:', error);
      return false;
    }
    return true;
  } catch (error) {
  debugLog('[deleteTripById] Exception', error);
    return false;
  }
};
