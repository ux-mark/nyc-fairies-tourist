
# Copilot 
Important Standards
- Ensure code quality and consistency to deploy using GitHub and Vercel.
- Code should be modular and reusable.
- Follow best practices for accessibility and SEO.
- Ensure responsive design for all components.
- Write clear and concise documentation.
- Prioritises user experience and performance.
- Writes in British English.

User Journey
1. The user lands on the homepage, where user can browse a curated list of NYC attractions, each displayed as an AttractionCard with essential details, user is invited to Select Trip Dates at the bottom of the page.

## User Journeys by Page

### Homepage (`src/app/page.tsx`)
- User lands on the homepage and browses a curated list of NYC attractions.
- Each attraction is displayed as an AttractionCard with essential details.
- User is invited to select trip dates at the bottom of the page.
- User can search for attractions using the SearchBar.
- User can filter attractions by category using the CategoryFilter.
- Responsive design ensures seamless experience on desktop and mobile.
- Sticky footer provides access to secondary and important information.

### About Section (`src/app/about/page.tsx`)
- User can view more information about the project in the About section.
- (Note: Section may need further content as per author’s comment.)

### Trip Planning (`TripSchedule`, `SaveTripModal`)
- User can add attractions to their trip schedule interactively.
- User can save their trip itinerary for future reference by entering their phone number.

### Data Management (`DataManagementModal`)
- User has complete control over their data.
- User can delete their account and all associated data at any time.

### JFK to Manhattan Guide (`src/app/jfk-to-manhattan/page.tsx`, `JFKGuide`)
- User can access guides and tips for travelling from JFK to Manhattan.
- Includes image galleries, pro tips, subway maps, and transport options.

### Pre-Departure Information (`src/app/pre-departure/page.tsx`, `PreDeparture`)
- User can view pre-departure checklists and guides.
- Includes documentation checklist, ESTA guide, mobile comparison, and mobile options.

### Mobile Experience (`ClientMobileFooter`, `MobileScheduleFooter`)
- Dedicated mobile footers and navigation for enhanced mobile usability.
- All interactions prioritise accessibility, performance, and user experience.
3. The user can view more information about the project in the About section. (note for author: is this needed? If so fill it out sometime.)
4. The user can add attractions to their trip schedule, planning their visit interactively.
5. The user can save their trip itinerary for future reference, simply by entering in their phone number.

User Delights
- The responsive design ensures a seamless experience on both desktop and mobile, with dedicated mobile footers and navigation.
- The user can access any secondary and important information they need in their given task in the sticky footer.
- All interactions prioritise accessibility, performance, and user experience.
- User has complete control over their data, they can delete their account and all associated data at any time.


User Journeys

------------------

