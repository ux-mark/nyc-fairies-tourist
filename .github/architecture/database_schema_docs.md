# Supabase Database Schema: NYC Tourist App

## Overview
This database supports a NYC trip planning application with community-driven content where users can browse attractions, contribute their own discoveries, create trip schedules, and save their itineraries. The system uses email-based authentication with role-based permissions for user-generated content moderation.

## Table Structure

### Core Data Tables

#### `attractions`
**Purpose**: Stores detailed information about NYC tourist attractions and activities, including both admin-curated and user-submitted content.

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
  created_by UUID REFERENCES users(user_id), -- User who created this attraction
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')), -- Approval status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Design Decisions:**
- `created_by` references `users.user_id` (not `users.id` - see Users table structure)
- `status` defaults to 'pending' for new user submissions
- No 'rejected' status - rejected items are deleted
- Existing attractions were migrated to 'approved' status

#### `categories`
**Purpose**: Stores attraction categories for filtering and organization.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,              -- Category display name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Pre-populated Categories:**
- Entertainment & Shows
- Museums & Culture  
- Free & Low-Cost Attractions
- Observation Decks & Views
- Walking Tours & Neighborhoods
- Outer Borough Adventures
- Shopping
- Memorial & Historic Sites
- Food Experiences
- Transportation/Sightseeing

### User Management Tables

#### `users`
**Purpose**: Stores user profiles and roles, linked to Supabase Auth users.

| Column     | Type        | Constraints                    | Description                       |
|------------|-------------|--------------------------------|-----------------------------------|
| user_id    | UUID        | PK, REFERENCES auth.users(id)  | Supabase auth user ID            |
| email      | TEXT        | NOT NULL                       | User's email address             |
| role       | TEXT        | DEFAULT 'user', CHECK role IN ('user', 'admin') | User permission level |
| created_at | TIMESTAMPTZ | DEFAULT NOW()                  | Record creation timestamp         |
| updated_at | TIMESTAMPTZ | DEFAULT NOW()                  | Last update timestamp            |

**Important Note**: This table does NOT have an `id` column. The `user_id` column serves as the primary key and directly references Supabase's `auth.users(id)`.

**Admin User**: `who@thefairies.ie` has role = 'admin'

#### `trip_schedules`
**Purpose**: Stores user trip itineraries.

| Column      | Type        | Constraints                    | Description                       |
|-------------|-------------|--------------------------------|-----------------------------------|
| id          | UUID        | PK, default uuid_generate_v4() | Unique trip schedule ID           |
| user_id     | UUID        | FK → users(user_id), ON DELETE CASCADE | User who owns the trip       |
| name        | TEXT        | NOT NULL, default 'My NYC Trip' | Trip name                        |
| start_date  | DATE        |                                | Trip start date                   |
| end_date    | DATE        |                                | Trip end date                     |
| is_active   | BOOLEAN     | default true                   | Soft delete flag                  |
| created_at  | TIMESTAMPTZ | default NOW()                  | Record creation timestamp         |
| updated_at  | TIMESTAMPTZ | default NOW()                  | Last update timestamp            |

#### `scheduled_attractions`
**Purpose**: Links attractions to specific days in trip schedules.

| Column          | Type        | Constraints                    | Description                       |
|-----------------|-------------|--------------------------------|-----------------------------------|
| id              | UUID        | PK, default uuid_generate_v4() | Unique attraction assignment ID   |
| schedule_id     | UUID        | FK → trip_schedules(id), ON DELETE CASCADE | Linked trip schedule    |
| attraction_id   | TEXT        | NOT NULL                       | Attraction ID (from attractions table) |
| attraction_name | TEXT        | NOT NULL                       | Cached attraction name            |
| day_date        | DATE        | NOT NULL                       | Date of visit                     |
| added_at        | TIMESTAMPTZ | default NOW()                  | When added to schedule            |

## Content Visibility & Permissions

### Attraction Visibility Rules
1. **Public (Not Logged In)**: Only approved attractions visible
2. **Logged-In Users**: Approved attractions + their own pending submissions
3. **Admins**: All attractions (pending and approved)

### User Permissions
| Action | Regular User | Admin |
|--------|-------------|-------|
| View approved attractions | ✅ | ✅ |
| View own pending attractions | ✅ | ✅ |
| View others' pending attractions | ❌ | ✅ |
| Create new attraction | ✅ (pending status) | ✅ (any status) |
| Edit own attractions | ✅ | ✅ |
| Edit others' attractions | ❌ | ✅ |
| Approve attractions | ❌ | ✅ |
| Delete any attraction | ❌ | ✅ |
| Delete own pending attractions | ✅ | ✅ |

## Relationships

### Visual Summary
```
auth.users (Supabase) ──┐
                        │
users (user_id) ────────┘
    │
    ├── trip_schedules (many) ────< scheduled_attractions (many)
    │                           ╲
    │                            ╲── references attractions(id)
    └── attractions (many, via created_by)
```

### Detailed Relationships
- **auth.users** → **users**: One-to-one via `users.user_id`
- **users** → **trip_schedules**: One-to-many via `trip_schedules.user_id`
- **users** → **attractions**: One-to-many via `attractions.created_by`
- **trip_schedules** → **scheduled_attractions**: One-to-many via `scheduled_attractions.schedule_id`
- **attractions** → **scheduled_attractions**: Referenced via `scheduled_attractions.attraction_id` (soft reference)

## Row Level Security (RLS) Policies

### Users Table
```sql
-- Users can only access their own records
CREATE POLICY "Users can read own record" ON users 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own record" ON users 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert user record" ON users 
FOR INSERT WITH CHECK (user_id = auth.uid());
```

### Attractions Table
```sql
-- Public access to approved content
CREATE POLICY "Approved attractions visible to all" ON attractions 
FOR SELECT USING (status = 'approved');

-- Users see their own pending submissions
CREATE POLICY "Users see own pending attractions" ON attractions 
FOR SELECT USING (
  status = 'pending' AND created_by = auth.uid()
);

-- Admins see everything
CREATE POLICY "Admins see all attractions" ON attractions 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Content creation and modification
CREATE POLICY "Users can insert own attractions" ON attractions 
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own attractions" ON attractions 
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can update any attraction" ON attractions 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Deletion permissions
CREATE POLICY "Admins can delete any attraction" ON attractions 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can delete own pending attractions" ON attractions 
FOR DELETE USING (
  status = 'pending' AND created_by = auth.uid()
);
```

### Trip Management Tables
```sql
-- Trip schedules: users access their own trips
CREATE POLICY "Users can access own trips" ON trip_schedules 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE user_id = user_id AND users.user_id = auth.uid())
);

-- Scheduled attractions: access through trip ownership
CREATE POLICY "Users can access own scheduled attractions" ON scheduled_attractions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM trip_schedules ts 
    JOIN users u ON ts.user_id = u.user_id 
    WHERE ts.id = schedule_id AND u.user_id = auth.uid()
  )
);
```

## Performance Indexes

### Current Indexes
```sql
-- User lookups
CREATE INDEX idx_users_role ON users(role);

-- Attraction queries
CREATE INDEX idx_attractions_created_by ON attractions(created_by);
CREATE INDEX idx_attractions_status ON attractions(status);
CREATE INDEX idx_attractions_tags ON attractions USING GIN(tags);

-- Trip management
CREATE INDEX idx_trip_schedules_user_id ON trip_schedules(user_id);
CREATE INDEX idx_scheduled_attractions_schedule_id ON scheduled_attractions(schedule_id);
CREATE INDEX idx_scheduled_attractions_day_date ON scheduled_attractions(day_date);
```

## Data Flow Examples

### User Submits New Attraction
1. User fills out attraction form in UI
2. `createAttraction()` inserts record with `created_by = auth.uid()` and `status = 'pending'`
3. Attraction appears in user's "My Attractions" dashboard
4. Admin sees attraction with yellow border (pending status)
5. Admin clicks "Approve" → `status` changes to 'approved'
6. Attraction becomes visible to all users

### User Creates Trip Schedule
1. User selects date range in trip planner
2. `trip_schedules` record created with `user_id = users.user_id` where `users.user_id = auth.uid()`
3. User adds attractions to specific days
4. Each addition creates `scheduled_attractions` record linking `schedule_id` to `attraction_id`

### Admin Content Moderation
1. Admin views attractions list (sees all attractions via RLS policy)
2. Visual indicators show status: green borders (approved), yellow borders (pending)
3. Admin clicks approve/edit/delete based on content quality
4. Changes are immediately reflected due to RLS policy updates

## TypeScript Integration

```typescript
// Core interfaces matching database schema
interface User {
  user_id: string;      // Supabase auth UUID
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface Attraction {
  id: string;                    // Unique slug
  name: string;                  // Required
  category: string;              // Required, from categories table
  tags?: string[];               // Optional array
  price_range?: string;          // Optional price info
  duration?: string;             // Optional time estimate
  location: string;              // Required location
  resources?: AttractionResource[]; // Optional links with text/url
  notes?: string;                // Optional description
  nearby_attractions?: string[]; // Optional related attractions
  walking_distance?: string;     // Optional distance info
  venue_size?: string;           // Optional capacity info
  todos?: string[];              // Optional admin notes
  created_by?: string;           // UUID of creating user
  status: 'pending' | 'approved'; // Approval status
  created_at?: string;           // Auto-generated timestamp
  updated_at?: string;           // Auto-generated timestamp
}

interface AttractionResource {
  text: string;  // Display text for link
  url: string;   // URL destination
}

interface TripSchedule {
  id: string;
  user_id: string;     // References users.user_id
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

## Security Considerations

### Authentication Flow
1. Users authenticate via Supabase Auth (email magic links)
2. User record created in `users` table with `user_id = auth.uid()`
3. All database operations use `auth.uid()` for permission checking
4. RLS policies automatically enforce user-specific data access

### Content Security
- **No unauthenticated content creation**: Users must be logged in to submit attractions
- **Pending by default**: User submissions require admin approval
- **Owner-only editing**: Users can only modify their own submissions
- **Admin oversight**: Full admin access for quality control
- **No data leakage**: RLS ensures users only see appropriate content

### Data Integrity
- **Foreign key constraints**: Ensure referential integrity between tables
- **Check constraints**: Validate enum values (user roles, attraction status)
- **Required fields**: Database enforces critical data requirements
- **Unique constraints**: Prevent duplicate categories and emails

## Migration History

### Recent Changes (Current Implementation)
1. **Added user roles**: `users.role` column with 'user'/'admin' values
2. **Added attraction ownership**: `attractions.created_by` references users
3. **Added approval workflow**: `attractions.status` with 'pending'/'approved' states
4. **Updated RLS policies**: Comprehensive permission system for user-generated content
5. **Added performance indexes**: Optimized queries for common access patterns
6. **Set admin user**: `who@thefairies.ie` configured as admin

### Database Schema Evolution
- **Phase 1**: Basic attractions catalog with static data
- **Phase 2**: User authentication and trip planning
- **Phase 3**: Community contributions and content moderation (current)
- **Phase 4**: Future enhancements (image uploads, reviews, etc.)

## Recommendations for Future Development

### Immediate Optimizations
1. **Add email notifications**: Alert admin when new attractions are submitted
2. **Implement soft deletes**: Track deleted attractions for audit purposes
3. **Add submission timestamps**: Better tracking of content creation flow

### Potential Enhancements
1. **Image uploads**: Allow photos for user-submitted attractions
2. **User reviews**: Rating and review system for attractions
3. **Moderation notes**: Track why content was approved/rejected
4. **Bulk operations**: Admin tools for managing multiple submissions
5. **Content versioning**: Track changes to attraction details over time

### Scalability Considerations
1. **Caching layer**: For frequently accessed approved attractions
2. **Search optimization**: Full-text search across attraction content
3. **API rate limiting**: Prevent abuse of content submission
4. **Content archival**: Long-term storage strategy for inactive data

This schema successfully balances user empowerment with content quality, providing a foundation for sustainable community-driven growth while maintaining administrative control and data security.