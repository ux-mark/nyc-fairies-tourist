# Supabase Database Schema: NYC Tourist App

## Overview
This database supports a NYC trip planning application where users can browse attractions, create trip schedules, and save their itineraries using just a phone number for identification.

## Table Structure

### Core Data Tables

#### `attractions`
**Purpose**: Stores detailed information about NYC tourist attractions and activities.

```sql
CREATE TABLE attractions (
  id TEXT PRIMARY KEY,                    -- Unique slug identifier (e.g., 'broadway-theatre')
  name TEXT NOT NULL,                     -- Display name (e.g., 'Broadway Theatre')
  category TEXT NOT NULL,                 -- Category name
  tags TEXT[],                           -- Array of searchable tags ['theatre', 'indoor', 'expensive']
  price_range TEXT,                      -- Human-readable price (e.g., '$120-200')
  duration TEXT,                         -- Expected visit time (e.g., '2.5-3 hours')
  location TEXT,                         -- Geographic description
  resources JSONB,                       -- Array of objects: [{"text": "Official Site", "url": "https://..."}]
  notes TEXT,                           -- Additional descriptive information
  nearby_attractions TEXT[],             -- Array of related attraction names
  walking_distance TEXT,                 -- Distance to nearby attractions
  venue_size TEXT,                      -- Capacity or size information
  todos TEXT[],                         -- Internal notes for data completion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `categories`
**Purpose**: Stores attraction categories for filtering and organization.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,              -- Category display name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Management Tables

#### `users`
| Column        | Type      | Constraints                | Description                       |
|--------------|-----------|----------------------------|-----------------------------------|
| id           | UUID      | PK, default uuid_generate_v4() | Unique user ID                    |
| phone_number | TEXT      | UNIQUE, NOT NULL           | User's phone number (identifier)  |
| created_at   | TIMESTAMPTZ | default NOW()             | Record creation timestamp         |
| updated_at   | TIMESTAMPTZ | default NOW()             | Last update timestamp             |

#### `trip_schedules`
| Column      | Type      | Constraints                | Description                       |
|-------------|-----------|----------------------------|-----------------------------------|
| id          | UUID      | PK, default uuid_generate_v4() | Unique trip schedule ID           |
| user_id     | UUID      | FK → users(id), ON DELETE CASCADE | User who owns the trip           |
| name        | TEXT      | NOT NULL, default 'My NYC Trip' | Trip name                        |
| start_date  | DATE      |                            | Trip start date                   |
| end_date    | DATE      |                            | Trip end date                     |
| is_active   | BOOLEAN   | default true               | Soft delete flag                  |
| created_at  | TIMESTAMPTZ | default NOW()             | Record creation timestamp         |
| updated_at  | TIMESTAMPTZ | default NOW()             | Last update timestamp             |

#### `scheduled_attractions`
| Column          | Type      | Constraints                | Description                       |
|-----------------|-----------|----------------------------|-----------------------------------|
| id              | UUID      | PK, default uuid_generate_v4() | Unique attraction assignment ID   |
| schedule_id     | UUID      | FK → trip_schedules(id), ON DELETE CASCADE | Linked trip schedule         |
| attraction_id   | TEXT      | NOT NULL                   | Attraction ID (from attractions table) |
| attraction_name | TEXT      | NOT NULL                   | Cached attraction name            |
| day_date        | DATE      | NOT NULL                   | Date of visit                     |
| added_at        | TIMESTAMPTZ | default NOW()             | When added to schedule            |

## Relationships

### Visual Summary
```
users (1) ────< trip_schedules (many) ────< scheduled_attractions (many)
                                      ╲
                                       ╲── references attractions(id)
```

### Detailed Relationships
- **users** → **trip_schedules**: One-to-many via `trip_schedules.user_id`
- **trip_schedules** → **scheduled_attractions**: One-to-many via `scheduled_attractions.schedule_id`
- **attractions** → **scheduled_attractions**: Referenced via `scheduled_attractions.attraction_id` (soft reference)

## Data Flow Example

### User saves a trip:
1. If phone number is new, create user record in `users`
2. Create trip schedule in `trip_schedules` linked to user via `user_id`
3. Each attraction added to trip is saved in `scheduled_attractions` linked via `schedule_id`

### User loads trips:
1. Find user by phone number in `users`
2. Load all trip schedules for that user from `trip_schedules`
3. For each trip schedule, load all scheduled attractions from `scheduled_attractions`

## Security Configuration

### Row Level Security (RLS) Policies
Currently configured with permissive policies for MVP/testing:

#### All Tables
- **Allow insert for all**: Anyone can create records
- **Allow select for all**: Anyone can read records  
- **Allow update for all**: Anyone can update records (users table)

## Performance Indexes

### Current Indexes
- `users(phone_number)` - User lookup by phone
- `trip_schedules(user_id)` - Trip schedules by user
- `scheduled_attractions(schedule_id)` - Attractions by trip
- `scheduled_attractions(day_date)` - Attractions by date
- `attractions(tags)` - GIN index for fast tag searches

## TypeScript Integration

```typescript
// Database schema interfaces
interface AttractionResource {
  text: string;
  url: string;
}

interface Attraction {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  price_range?: string;
  duration?: string;
  location?: string;
  resources?: AttractionResource[];
  notes?: string;
  nearby_attractions?: string[];
  walking_distance?: string;
  venue_size?: string;
  todos?: string[];
  created_at?: string;
}

interface User {
  id: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

interface TripSchedule {
  id: string;
  user_id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ScheduledAttraction {
  id: string;
  schedule_id: string;
  attraction_id: string;
  attraction_name: string;
  day_date: string;
  added_at: string;
}
```

## Recommendations for Improvements

### Critical for Production
1. **Tighten RLS Policies**: Current policies allow global access. For production, implement user-specific policies:
   ```sql
   -- Example: Users can only access their own data
   CREATE POLICY "Users can only access own trips" ON trip_schedules 
   FOR ALL USING (user_id = auth.uid());
   ```

2. **Add Phone Number Validation**: Consider adding a check constraint for phone number format to ensure data consistency.

### Enhancements Required
1. **Add Attraction Foreign Key**: If you want referential integrity between `scheduled_attractions.attraction_id` and `attractions.id`, add a foreign key constraint. 
To prevent issues we need to add an ability fo rusers to be able to add attractions. 
