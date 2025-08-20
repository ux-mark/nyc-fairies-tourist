# JFK to Manhattan Transportation Guide - Development Specifications

## Page Overview
Create a comprehensive guide page at `/jfk-to-manhattan` helping visitors navigate from JFK Airport to Manhattan with step-by-step visual instructions and transportation options.

## Content Structure

### Page Header
- **Title:** "Getting from JFK Airport to Manhattan: Complete Guide"
- **Subtitle:** "Your step-by-step journey from touchdown to the Fairies"
- **Hero image:** <put in a placeholder image of the NYC skyline here>

### Section 1: Image Gallery with Instructions
Display all images from `src/images` in the specified order, each with accompanying text:

**Image 1:** Get to Baggage
*Placeholder text:* "Follow the signs for Baggage Services and Ground Transportation (image is from T7 - terminal used by Aer Lingus)."

**Image 2:** Exiting the Airport
*Placeholder text:* "After collecting your baggage, follow the clearly marked signs for 'AirTrain' in your terminal (image is from T7 - terminal used by Aer Lingus)."

**Image 3 & Image 4** Finding the Tracks: "The AirTrain entrance is typically located near the parking garage, accessible by elevator to Level 3 (image is from T7 - terminal used by Aer Lingus)."

**Image 5** Board the Red Train: "Board the AirTrain heading to Jamaica Station (red line). The train runs every 4-8 minutes and is free between terminals but costs $8.50 when exiting to Jamaica Station. The AirTrain Jamaica Line (red) connects all terminals to Jamaica Station where you'll transfer to the Long Island Rail Road (LIRR). Journey time: approximately 15 minutes."

**Image 6:** Exiting Air Train at Jamacia: "You can use your contactless credit card, Apple or Google pay to pay the AirTrain fee on your way out. Scan, wait for the green light and go!" 

**Image 7: <use a placehonder>** Jamaica Station platform/LIRR connection: "At Jamaica Station, follow signs for 'Long Island Rail Road' or 'LIRR'. You'll need to purchase tickets before boarding - use the ticket machines or download the MTA TrainTime app [link to details below]. Purchase your LIRR ticket to Penn Station. Off-peak fares are $7.75, peak fares (weekdays 4-8pm) are $10.75. Children under 5 ride free."

**Image 8: <use a placeholder>** LIRR train interior/Penn Station arrival
*Placeholder text:* "Board any westbound LIRR train to Penn Station. Journey time: 20 minutes. Trains run frequently with more space for luggage than subway."

#### Technical Implementation for Images:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {images.map((image, index) => (
    <div key={index} className="bg-card rounded-xl shadow-lg overflow-hidden">
      <img 
        src={`/images/${image.filename}`} 
        alt={image.alt} 
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold mb-2">Step {index + 1}</h3>
        <p className="text-sm text-muted-foreground">{image.description}</p>
      </div>
    </div>
  ))}
</div>
```

### Section 2: Transportation Options Breakdown

#### Option 1: AirTrain + LIRR (Recommended)
- **Total Cost:** $16.25 off-peak / $19.25 peak (including $8.50 AirTrain)
- **Journey Time:** 35-45 minutes total
- **Frequency:** Every 3-20 minutes depending on time
- **Benefits:** Fast, reliable, luggage space, direct to Penn Station where we will meet you.

**Ticket Purchase Options:**
1. **MTA TrainTime App** (Recommended)
   - Download before travel: [iOS](https://apps.apple.com/us/app/mta-traintime/id1104885987) | [Android](https://play.google.com/store/apps/details?id=com.mta.mobileapp)
   - Purchase day-of-travel only
   - Accepts Apple Pay, Google Pay, credit/debit cards
   - Show digital ticket to conductor

2. **Ticket Machines at Jamaica Station**
   - Located after AirTrain exit
   - Accept cash (up to $50 bills), credit/debit cards
   - Keep paper ticket for conductor

3. **On-Train Purchase** (Not Recommended)
   - $5.75-$6.50 surcharge applies
   - Cash or card accepted
   - Only one-way tickets available

#### Option 2: Taxi (Yellow Cab)
- **Flat Rate:** $70 (Manhattan only)
- **Additional Costs:**
  - Tolls: $5-10 (depending on route)
  - MTA State Surcharge: $0.50
  - Peak Hour Surcharge: $5 (weekdays 4-8pm)
  - NY State Congestion Surcharge: $2.50 (trips south of 96th St)
  - Tip: 15-20% ($12-15 typical)
- **Total Estimated Cost:** $90-105
- **Journey Time:** 45-75 minutes (traffic dependent)

### Section 3: Subway Navigation Help
#### Getting Around Manhattan
**Primary Line: 1 Train (West Side)**
- Runs north-south on Manhattan's west side
- **Key Stops for Visitors:**
  - 34th St-Penn Station (LIRR arrival point)
  - 42nd St-Times Square (Broadway, theaters)
  - 59th St-Columbus Circle (bottom of Central Park)
  - 103rd St or 110th St (where you are staying with the Fairies)

**Alternative: 2/3 Trains**
- Also north-south, express service
- Transfer at 96th St to 1 train, or walk from 96th St

**Payment:**
- Tap contactless credit/debit card or mobile wallet
- No need for MetroCard for single rides
- $2.90 per ride

### Section 4: Pro Tips & Important Notes

#### Money-Saving Tips
- Download MTA TrainTime app before departure
- Avoid on-train LIRR ticket purchases (expensive surcharge)
- Consider subway if staying near other train lines
- Taxi flat rate doesn't include tolls or tips

#### Timing Considerations
- **Peak Hours:** Weekdays 4-8pm (higher fares, more crowded)
- **Off-Peak:** All other times (better value, more comfortable)
- **Late Night:** All options run 24/7 but less frequent


### Technical Implementation Notes

#### Component Structure
```
src/
├── app/
│   └── jfk-to-manhattan/
│       └── page.tsx
├── components/
│   ├── JFKGuide/
│   │   ├── ImageGallery.tsx
│   │   ├── TransportOptions.tsx
│   │   ├── SubwayMap.tsx
│   │   └── ProTips.tsx
└── images/
    ├── jfk-terminal-airtrain.jpg
    ├── airtrain-platform.jpg
    ├── airtrain-route-map.jpg
    ├── jamaica-station-lirr.jpg
    ├── lirr-ticket-machine.jpg
    └── lirr-train-penn.jpg
```

#### Mobile Responsiveness Requirements
- Images: Responsive grid (1 column mobile, 2 columns tablet+)
- Text: Readable font sizes (min 16px mobile)
- Navigation: Sticky header with page sections
- Touch targets: Minimum 44px for interactive elements

#### SEO Considerations
- **Meta title:** "JFK to Manhattan Transportation Guide 2025 | NYC with The Fairies"
- **Meta description:** "Complete step-by-step guide from JFK Airport to Manhattan. AirTrain, LIRR, subway, and taxi options with current prices and schedules."
- **Schema markup:** TransportationGuide structured data
- **Image alt text:** Descriptive text for each step image

#### Accessibility Features
- **ARIA labels:** For image gallery navigation
- **Skip links:** To main content sections
- **High contrast:** Ensure text meets WCAG standards
- **Screen reader:** Logical heading hierarchy (H1 → H2 → H3)

### Links to Include
- [MTA TrainTime App](https://www.mta.info/traintime)
- [LIRR Schedules](https://www.mta.info/schedules)
- [MTA Trip Planner](https://www.mta.info/trip-planner)
- [NYC Taxi Information](https://www.nyc.gov/site/tlc/passengers/taxi-fare.page)
- [JFK Airport Official Site](https://www.jfkairport.com/to-from-airport)

## Content Enhancement Suggestions

Add these sections to improve user experience:

### Real-Time Integration (Future Enhancement)
- Live LIRR departure times
- Current taxi wait times
- Traffic conditions affecting journey time

### Interactive Elements
- Cost calculator based on travel time and passenger count
- Route planner with user preferences
- Step-by-step visual timeline

### User Feedback Section
- Quick survey: "Was this guide helpful?"
- Comment system for user tips and updates
- Report outdated information feature

This comprehensive guide will provide visitors with clear, actionable information to navigate from JFK to Manhattan confidently, with visual aids and up-to-date pricing and schedule information.