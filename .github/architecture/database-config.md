## Table Relationships Explained

### Visual Summary

```
users (1) ────< trip_schedules (many) ────< scheduled_attractions (many)
```

This structure allows each user to have multiple trips, and each trip to have multiple attractions scheduled for specific days.
## Supabase Database Schema: NYC Tourist App

### Tables

#### 1. users
| Column        | Type      | Constraints                | Description                       |
|--------------|-----------|----------------------------|-----------------------------------|
| id           | UUID      | PK, default uuid_generate_v4() | Unique user ID                    |
| phone_number | TEXT      | UNIQUE, NOT NULL           | User's phone number (identifier)  |
| created_at   | TIMESTAMPTZ | default NOW()             | Record creation timestamp         |
| updated_at   | TIMESTAMPTZ | default NOW()             | Last update timestamp             |

#### 2. trip_schedules
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

#### 3. scheduled_attractions
| Column          | Type      | Constraints                | Description                       |
|-----------------|-----------|----------------------------|-----------------------------------|
| id              | UUID      | PK, default uuid_generate_v4() | Unique attraction assignment ID   |
| schedule_id     | UUID      | FK → trip_schedules(id), ON DELETE CASCADE | Linked trip schedule         |
| attraction_id   | TEXT      | NOT NULL                   | Attraction ID (from attractions.json) |
| attraction_name | TEXT      | NOT NULL                   | Cached attraction name            |
| day_date        | DATE      | NOT NULL                   | Date of visit                     |
| added_at        | TIMESTAMPTZ | default NOW()             | When added to schedule            |

### How tables are connected

- **users**: Each user is identified by a unique phone number and has a UUID primary key (`id`).

- **trip_schedules**: Each trip schedule belongs to a user. The `user_id` column in `trip_schedules` is a foreign key referencing `users(id)`. This means:
	- One user can have many trip schedules (one-to-many relationship).
	- Each trip schedule is linked to exactly one user.

- **scheduled_attractions**: Each scheduled attraction is linked to a trip schedule. The `schedule_id` column in `scheduled_attractions` is a foreign key referencing `trip_schedules(id)`. This means:
	- One trip schedule can have many scheduled attractions (one-to-many relationship).
	- Each scheduled attraction is linked to exactly one trip schedule.

### Example Flow

1. **User saves a trip:**
	 - If the phone number is new, a user record is created in `users`.
	 - A new trip schedule is created in `trip_schedules` and linked to the user via `user_id`.
	 - Each attraction added to the trip is saved in `scheduled_attractions` and linked to the trip schedule via `schedule_id`.

2. **User loads trips:**
	 - The app finds the user by phone number in `users`.
	 - All trip schedules for that user are loaded from `trip_schedules`.
	 - For each trip schedule, all scheduled attractions are loaded from `scheduled_attractions`.
     

### Row Level Security (RLS) Policies

#### users
- **Allow insert for all:**
	- Allows anyone to insert a new user (phone number).
- **Allow update for all:**
	- Allows anyone to update user records (required for upsert).
- **Allow select for all:**
	- Allows anyone to read user records (optional for debugging).

#### trip_schedules
- **Allow insert for all:**
	- Allows anyone to insert a new trip schedule.
- **Allow select for all:**
	- Allows anyone to read trip schedules (optional for debugging).

#### scheduled_attractions
- **Allow insert for all:**
	- Allows anyone to insert scheduled attractions.
- **Allow select for all:**
	- Allows anyone to read scheduled attractions (optional for debugging).

### Relationships
- `users` (1) → (many) `trip_schedules` via `user_id`
- `trip_schedules` (1) → (many) `scheduled_attractions` via `schedule_id`

### Indexes
- `users(phone_number)`
- `trip_schedules(user_id)`
- `scheduled_attractions(schedule_id)`
- `scheduled_attractions(day_date)`

### Notes
- All tables use UUID primary keys.
- Phone number is the only user identifier; no password or email is stored.
- RLS policies are permissive for MVP/testing; tighten for production as needed.
