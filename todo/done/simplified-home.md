# Simplifying the Homepage: Implementation Plan & Required Updates

This is a precise, file-by-file delta to transform the current homepage into the simplified design shown in the attached mock (clean black/white theme, pill filters, centered search, minimalist cards, sticky schedule sidebar with date range and day boxes).

The notes below reflect the current implementation from the repo (verified via semantic scan) and what must change. Use this as the single source of truth for the refactor.

---

## Summary of key gaps vs. design
- Layout is stacked (Attractions → Schedule → About). Design requires a two-column layout: attractions on the left, a right sticky sidebar for the schedule.
- No shared schedule state between cards and the schedule; cards can’t “Add to Schedule”.
- Schedule UI is a builder listing all attractions, not a date-based sidebar with start/end date and daily boxes.
- Header has nav and scroll spy; design shows a minimal title-only bar.
- Metadata still uses “Create Next App”.
- About section appears on homepage; design shows a clean layout without it.
- Accessibility: search lacks an explicit label; some interactive pills/buttons need improved focus states and ARIA.

---

## Architecture changes (new)
Create a shared schedule context to manage date range, days, active day, and day-specific items.

- New file: `src/lib/schedule-context.tsx`
  - Exports `<ScheduleProvider>` and `useSchedule()` hook.
  - State shape:
    - `startDate: string | null` (ISO `YYYY-MM-DD`)
    - `endDate: string | null`
    - `days: { date: string; items: Attraction[] }[]`
    - `activeDayIndex: number` (defaults to 0 when `days.length > 0`)
  - Actions:
    - `setDateRange(start?: string | null, end?: string | null)` → recompute `days` inclusive using local time; clamp invalid ranges; preserve items when possible if dates shift (basic behavior: clear for now).
    - `setActiveDay(i: number)`
    - `addToActiveDay(a: Attraction)` (no duplicates per day by `id`)
    - `removeFromDay(i: number, id: string)`
    - `reset()`
  - Persistence: Save to `localStorage` on change; hydrate on mount (guard for SSR).

Integration placement:
- Wrap the homepage (only) with `<ScheduleProvider>` inside `src/app/page.tsx` around the two-column layout. Do NOT put the provider in `RootLayout` so it remains page-scoped.

---

## Page layout: `src/app/page.tsx`
- Current:
  - Vertically stacked sections: `<AttractionsList />`, `<TripSchedule />`, `<AboutSection />`.
- Required changes:
  1. Remove the About section entirely from this page.
  2. Replace stacked sections with a responsive grid:
     - Desktop: `grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8` (or `lg:grid-cols-3` with `col-span-2` left, `col-span-1` right).
     - Left column: heading + `<AttractionsList />` (filters + search + cards) in a single flow.
     - Right column: `<TripSchedule />` wrapped in a sticky container: `lg:sticky lg:top-6 self-start`.
  3. Wrap everything in `<ScheduleProvider>`.
  4. Page title remains “NYC Attractions”.

Resulting structure (conceptual):
- `<ScheduleProvider>`
  - `div.container`
    - left: `<AttractionsList />`
    - right: `<TripSchedule />`

---

## Header: `src/components/Header.tsx`
- Current: sticky header with nav (Attractions, Trip Schedule, About) and scroll spy.
- Required changes to match minimal design:
  - Remove nav links and scroll spy logic entirely.
  - Keep a compact left-aligned brand block only:
    - Black/near-black background (use existing `bg-primary text-primary-foreground` if your theme maps to black/white), no large shadows.
    - Title: “NYC with The Fairies” (or your exact desired title from the mock).
    - Optional small circular dot icon left of the text.
  - Ensure semantic `<header role="banner">` and tab-focus visible.

---

## Filters and search: `src/components/CategoryFilter.tsx` & `src/components/SearchBar.tsx`
- CategoryFilter (current): Pills rendered from `getCategories()`, with an “All” button; centered flex.
  - Keep behavior; refine styles:
    - Ensure obvious selected state and strong focus ring: e.g., `focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`.
    - Spacing consistent with mock; use `mb-6` below the pills.
  - Accessibility:
    - Wrap in `nav aria-label="Filter by category"`.
    - Each pill is a `<button aria-pressed={selected===cat}>`.

- SearchBar (current): centered form with input and submit button.
  - Keep centered position below pills.
  - Add explicit label for accessibility:
    - Visually-hidden `<label id>` for the input; associate via `htmlFor`.
    - Add `aria-label="Search attractions"` on input as a fallback.
  - Ensure `type="search"`, `enterKeyHint="search"`, and focus ring.

- Filtering logic in `src/components/AttractionsList.tsx`:
  - Current behavior filters by category and by search text across `name`, `category`, and `tags`.
  - Keep this; add a tiny debounce to the search input (optional) to avoid excessive filtering.

---

## Attractions list and cards
- `src/components/AttractionsList.tsx` (current): Renders `<CategoryFilter />`, `<SearchBar />`, and a 1/2/3-column grid of `<AttractionCard />`.
  - Keep structure; ensure parent container max-width stretches nicely under the header.
  - No card images.
  - Consider `aria-live="polite"` on the grid for result count changes (optional).

- `src/components/AttractionCard.tsx` (current): Minimal information with title, category, tags, price, duration, location, and notes.
  - Required additions:
    - Add a primary action button at the bottom: “Add to Schedule”.
    - Hook this button into `useSchedule().addToActiveDay(attraction)`.
    - Disable the button with an alternative label when the item already exists in the active day (e.g., “Added”).
    - Ensure `aria-pressed` semantics or `aria-disabled` when appropriate.
  - Styling per mock: slightly rounded, subtle shadow, whitespace already present—keep hover scale modest.

---

## Schedule sidebar: `src/components/TripSchedule.tsx`
Replace the current builder (which lists all attractions with add/remove) with a date-based sidebar that consumes the `ScheduleContext`.

- Structure:
  - Heading “Trip Schedule”.
  - Two date pickers (Start Date, End Date): `<input type="date">` bound to context `startDate`/`endDate`.
    - On change, call `setDateRange(start, end)` → recompute `days`.
  - Days list (for each day):
    - A bordered card with the weekday and “DD Mon” (format client-side; e.g., via `toLocaleDateString`).
    - Clickable header sets `setActiveDay(index)`; visually highlight the active day.
    - Inside: if empty → show “+ Add Attractions” placeholder.
    - If items exist: list small chips with name and a remove “×”.
  - Sticky on desktop: container `className="lg:sticky lg:top-6"`.

- Behavior:
  - “Add to Schedule” in a card adds to the currently active day. If there is no date range or no active day, guide the user (toast or inline text) to set dates first; as a fallback, create a single-day range for today.
  - Provide a small “Reset” button to clear schedule.
  - Optional: persist in `localStorage` (handled in context).

- Remove from this component:
  - The “All Attractions” column and its per-item add buttons.

---

## About section removal & new route
- `src/app/page.tsx`: delete the `<AboutSection />` section.
- Add a lightweight about page later (optional): `src/app/about/page.tsx` rendering current `AboutSection` content.
- In `Footer`, include a simple link to `/about` rather than duplicating content on the homepage.

---

## Footer: `src/components/Footer.tsx`
- Keep minimal. Optionally add a link to `/about`.
- Ensure color contrast is OK on the chosen background.

---

## Metadata & head: `src/app/layout.tsx`
- Update `metadata` to be project-specific:
  - `title: "NYC Tourist Info – Plan Your Trip"`
  - `description: "Browse NYC attractions, filter by category, and build a day-by-day schedule."`
  - Add `metadataBase`, `openGraph`, and `twitter` objects if desired.

---

## Theming & styles
- Continue using existing shadcn tokens (`bg-card`, `bg-primary`, etc.) but ensure they map to a black/white palette in your Tailwind/shadcn theme.
- Ensure consistent rounded corners (`rounded-xl`), subtle shadows (`shadow-sm`/`shadow-lg`), and generous whitespace (`p-5`, `gap-6`).
- Verify focus-visible rings across all interactive elements.

---

## Accessibility checklist
- Add an accessible name to the search input (`label` + `aria-label`).
- Pills use `aria-pressed` and have visible focus.
- The schedule day headers are buttons with `aria-current={active ? 'date' : undefined}`.
- Announce schedule updates (optional): toast or `aria-live` region.
- Ensure color contrast ≥ 4.5:1; verify tokens.

---

## Performance notes (nice-to-have)
- Debounce search input by ~150–250ms.
- Memoize `filtered` computations with `useMemo` when `allAttractions`, `selectedCategory`, and `query` change.

---

## File-by-file todo (actionable)

1) `src/app/page.tsx`
- Wrap content with `<ScheduleProvider>`.
- Replace vertical sections with a responsive grid and sticky sidebar.
- Remove `<AboutSection />`.

2) `src/components/Header.tsx`
- Strip nav/scroll spy; render a minimal brand-only header.

3) `src/components/AttractionsList.tsx`
- Keep structure; no API changes. Optionally add result count.

4) `src/components/AttractionCard.tsx`
- Add CTA button wired to `useSchedule().addToActiveDay(attraction)`.
- Prevent duplicates per active day; update button state accordingly.

5) `src/components/TripSchedule.tsx`
- Replace builder UI with date range inputs + per-day boxes from context.
- Add active day selection and reset.

6) `src/components/SearchBar.tsx`
- Add visible label (sr-only), `type="search"`, focus ring.

7) `src/components/CategoryFilter.tsx`
- Wrap in `nav aria-label`; ensure `aria-pressed` and focus-visible styles.

8) `src/app/layout.tsx`
- Update `metadata` fields for SEO; keep `<Header />` and `<Footer />` placement.

9) `src/app/about/page.tsx` (new, optional)
- Render content from `AboutSection` and remove it from the homepage.

10) `src/lib/schedule-context.tsx` (new)
- Implement provider/hook with state, actions, and localStorage persistence.

---

## Edge cases & behavior
- If end date < start date, clear `days` and show inline error under pickers.
- If no dates are set and user clicks “Add to Schedule”, either:
  - Prompt to set dates, or
  - Auto-create a single-day schedule for today (document chosen behavior in code comments).
- Avoid duplicates within the same day; allow the same attraction on different days.

---

## QA checklist (green before done)
- Build passes; no TS/ESLint errors.
- Keyboard-only navigation works across pills, search, cards, and schedule.
- Mobile: schedule stacks below attractions; sticky disabled on small screens.
- Desktop: schedule is sticky and doesn’t overlap footer.
- LocalStorage persistence verified (reload retains dates and items).
- Lighthouse: Accessible name on search; color contrast OK.

---

## Implementation checklist (tick as you go)
- [ ] Create `src/lib/schedule-context.tsx` with provider + persistence
- [ ] Update `src/app/page.tsx` to two-column grid with sticky sidebar
- [ ] Simplify `Header` to brand-only bar
- [ ] Add CTA and context wiring in `AttractionCard`
- [ ] Rebuild `TripSchedule` to date-based sidebar using context
- [ ] A11y updates: `SearchBar`, `CategoryFilter`, schedule day buttons
- [ ] SEO/metadata updates in `layout.tsx`
- [ ] Move About to `/about` and remove from homepage
- [ ] Theme audit: ensure black/white tokens and focus states
- [ ] Verify mobile/desktop behavior and persistence
