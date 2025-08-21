# NYC Tourist Info Colour Theme Update

## Overview
Updated the website's colour theme based on the vibrant, cozy living room palette from `colour-inspiration.html`. The new theme uses a centralised approach through Tailwind CSS and Shadcn UI variables, ensuring consistency and maintainability.

## Colour Palette

### Primary Colours
- **Electric Royal Blue** (`#0066FF`) - Primary navigation, headers, and branding
- **Brilliant Sky Blue** (`#00BFFF`) - Interactive elements and links
- **Darker Blue** (`#003399`) - Depth and contrast variations

### Accent Colours
- **Vibrant Sunset Orange** (`#FF6B35`) - Call-to-action buttons and highlights
- **Pure Gold** (`#FFD700`) - Premium touches and luxury appeal
- **Deeper Orange** (`#E55A2B`) - Contrast variations

### Success & Status
- **Electric Spring Green** (`#00FF7F`) - Success states and positive feedback
- **Balanced Red** - Error states and warnings (using semantic destructive colour)

### Neutral Colours
- **Lemon Chiffon** (`#FFFACD`) - Breathing room backgrounds
- **Warm Cream** (`#FFF8E7`) - Warmer background variation

## Technical Implementation

### 1. Tailwind Configuration (`tailwind.config.js`)
- Extended colour palette with brand colours
- Added custom colour classes for easy access
- Maintained backward compatibility

### 2. Global CSS Variables (`src/app/globals.css`)
- Updated Shadcn UI colour variables using OKLCH colour space
- Comprehensive light and dark mode support
- Semantic colour naming for better maintainability

### 3. Component Updates
Updated components to use semantic colour classes instead of hardcoded colours:

#### Updated Components:
- **Header.tsx** - Consistent button styling with theme colours
- **AttractionCard.tsx** - Fixed hover states to use opacity modifiers
- **PreDeparture Components**:
  - `DocumentationChecklist.tsx` - Theme-aware backgrounds
  - `ESTAGuide.tsx` - Semantic colour usage
  - `MobileOptions.tsx` - Consistent link styling
  - `MobileComparison.tsx` - Theme-aware table styling
- **Modal Components**:
  - `TripSchedule.tsx` - Semantic destructive colours
  - `LoadTripModal.tsx` - Consistent error styling
  - `SaveTripModal.tsx` - Theme-aware success states
  - `DataManagementModal.tsx` - Semantic warning colours
  - `AuthModal.tsx` - Success state consistency

### 4. New Features
- **ColourShowcase.tsx** - Interactive colour palette demonstration
- **Enhanced About Page** - Shows the new colour theme in action

## Design Principles

### Accessibility
- OKLCH colour space ensures consistent perceptual brightness
- High contrast ratios maintained for readability
- Semantic colour naming for screen readers

### User Experience
- Vibrant, energetic colours reflect NYC's dynamic spirit
- Warm touches (cream backgrounds) provide visual comfort
- Consistent colour usage across all components

### Maintainability
- Centralised colour management through CSS variables
- Semantic naming prevents colour misuse
- Easy theme switching capability

## Key Benefits

1. **Consistency** - All colours managed centrally through Shadcn UI variables
2. **Accessibility** - OKLCH colour space and proper contrast ratios
3. **Flexibility** - Easy to modify theme colours globally
4. **Performance** - CSS variables reduce bundle size
5. **Dark Mode** - Automatic dark mode support with appropriate colour adjustments
6. **Brand Alignment** - Colours reflect the vibrant, welcoming nature of NYC tourism

## Usage Examples

### Primary Actions
```jsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Book Now
</button>
```

### Success States
```jsx
<div className="bg-success/10 border border-success/20 text-success">
  Trip saved successfully!
</div>
```

### Warning States
```jsx
<div className="bg-destructive/10 border border-destructive/20 text-destructive">
  Please check your details
</div>
```

### Links
```jsx
<a className="text-primary hover:text-primary/80 underline">
  Learn more
</a>
```

## Testing
- Development server running successfully
- All components compile without errors
- Responsive design maintained across breakpoints
- Dark mode functionality preserved

The new colour theme brings energy and professionalism to the NYC Tourist Info website while maintaining excellent usability and accessibility standards.
