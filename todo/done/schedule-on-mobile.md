```markdown

```
## Mobile UX Improvement: Sticky Footer Schedule

### Goal
Enable users on mobile devices to view and interact with both the attractions list and their trip schedule simultaneously. The schedule will appear in a sticky, scrollable footer when the viewport is below a certain width (e.g., 768px).

---

### Implementation Steps

1. **Detect Mobile Viewport**
	- Use CSS media queries or a React hook (e.g., `useMediaQuery`) to detect when the user is on a small device.

2. **Create Sticky Footer Component**
	- Design a new component (e.g., `MobileScheduleFooter`) or adapt the existing `TripSchedule`.
	- Position it fixed to the bottom of the viewport (`position: fixed; bottom: 0; left: 0; width: 100%`).
	- Set a max height (e.g., `max-h-48` in Tailwind) and make it vertically scrollable (`overflow-y-auto`).

3. **Move/Render Schedule in Footer on Mobile**
	- Conditionally render the schedule in the sticky footer only on mobile.
	- Ensure the main attractions list remains visible and usable above the footer.

4. **Ensure Interactivity**
	- Allow users to add/remove items from the schedule directly from the attractions list.
	- Schedule in the footer should update in real time.

5. **Accessibility & Usability**
	- Make sure the footer is keyboard accessible and does not obscure important content.
	- Consider adding a handle or button to expand/collapse the schedule for more space.

6. **Testing**
	- Test on multiple device sizes and orientations.
	- Verify smooth scrolling, correct positioning, and no overlap with other UI elements.

---

### Files Likely to Change
- `src/components/TripSchedule.tsx` (or new `MobileScheduleFooter.tsx`)
- `src/app/layout.tsx` (for global positioning)
- `src/components/AttractionsList.tsx` (for add-to-schedule UX)
- `src/components/Header.tsx` and `Footer.tsx` (ensure no conflicts)
- `globals.css` or Tailwind config (for custom styles)

---

### Notes
- Use Tailwind CSS utilities for layout and responsiveness.
- Consider using React context or props to share schedule state between components.
- Document any new props, context, or hooks added.

---

**Next Steps:**
1. Design wireframe/mockup for mobile schedule footer.
2. Implement conditional rendering and sticky footer.
3. Test and iterate based on feedback.
