# Add User Profile (and allow saving of data)
## 1. Backend Storage

**Goal:** Persist user trip itineraries securely, keyed by phone number (hashed for privacy).

**Options:**
- Vercel Postgres (recommended for Vercel projects)
- Supabase (Postgres with instant REST API)
- Firebase (NoSQL, easy auth)
- Custom serverless API (Next.js API routes with any DB)

**Steps:**
1. Choose a database solution (Vercel Postgres is simple for Next.js).
2. Create a table (e.g. `itineraries`) with columns:
	- `id` (primary key, auto-increment or UUID)
	- `phone_hash` (string, hashed phone number)
	- `itinerary_data` (JSON or text)
	- `created_at`, `updated_at` (timestamps)
3. Use a secure hash function (e.g. bcrypt, SHA-256) to hash phone numbers before storing.
4. Ensure DB access is via environment variables (never hardcode credentials).
5. For serverless, use Next.js API routes in `src/app/api/` to interact with DB.

## 2. API Endpoints

**Goal:** Provide secure endpoints for saving, retrieving, and deleting itineraries.

**Endpoints:**
- `POST /api/itinerary`
	- Request: `{ phone: string, itinerary: object }`
	- Action: Hash phone, store itinerary in DB (create or update)
	- Response: Success/failure
- `GET /api/itinerary?phone=...`
	- Request: Query param `phone`
	- Action: Hash phone, fetch itinerary from DB
	- Response: `{ itinerary: object }` or error
- `DELETE /api/itinerary?phone=...`
	- Request: Query param `phone`
	- Action: Hash phone, delete itinerary from DB
	- Response: Success/failure

**Implementation Notes:**
- Hash phone numbers server-side before DB queries.
- Validate input (phone format, itinerary structure).
- Return clear error messages for not found, invalid, or failed operations.
- Use HTTPS and secure headers.

## 3. Frontend Changes

**Goal:** Allow users to save, retrieve, and delete their itinerary using their phone number.

**UI Elements:**
- **Save Itinerary Form:**
	- Input: Phone number
	- Button: "Save My Trip"
	- On submit: POST to `/api/itinerary` with phone and itinerary data
- **Retrieve Itinerary Form:**
	- Input: Phone number
	- Button: "Load My Trip"
	- On submit: GET `/api/itinerary?phone=...`, populate schedule
- **Delete Data Button:**
	- Input: Phone number
	- Button: "Delete My Data"
	- On click: DELETE `/api/itinerary?phone=...`, show confirmation

**UX Considerations:**
- Validate phone number format client-side before sending.
- Show loading, success, and error states for all actions.
- Make forms accessible (labels, aria attributes).
- Clearly explain privacy: phone is only used for saving/retrieving data, can be deleted anytime.

**Future AI Agent Notes:**
- Ensure API calls hash phone numbers before sending to backend (or hash server-side for security).
- Use modular React components for forms and buttons.
- Consider rate limiting and abuse prevention for endpoints.

## Privacy & Security
 - Hash phone numbers before storing.  - Use HTTPS and secure API routes.  - Add privacy info to your site (how data is used, deletion policy).

## Vercel Configuration
 - If using Vercel serverless functions, no extra config is needed—just add your API routes in src/app/api/.  - If using an external DB, set environment variables for DB credentials in Vercel.