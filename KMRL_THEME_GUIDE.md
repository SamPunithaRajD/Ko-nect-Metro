# KO-NECT KMRL Official Color Theme

This document outlines the official Kochi Metro Rail Limited (KMRL) color theme applied throughout the KO-NECT Metro Operations Control System.

## Official KMRL Color Palette

### Primary Colors
- **KMRL Red**: `#E31E24` - Used for main buttons, primary highlights, alerts, and active selections
- **Dark Red**: `#B71C1C` - Used for button hover states, active emphasis, and important actions
- **Deep Metro Blue**: `#003A8F` - Used for sidebar, headers, navigation bar, and dashboard titles
- **Light Metro Blue**: `#0072CE` - Used for links, route lines, secondary highlights, and standby status

### Neutral Colors
- **White**: `#FFFFFF` - Used for cards, tables, and main content backgrounds
- **Light Grey**: `#F2F2F2` - Used for panel backgrounds, table row alternates, and subtle backgrounds
- **Dark Grey**: `#333333` - Used for text, borders, and secondary content

### Operational Status Colors
- **Ready/Active/Service**: `#28A745` (Green) - Indicates operational and active vehicles
- **Maintenance/Critical**: `#E31E24` (KMRL Red) - Indicates vehicles under maintenance or critical issues
- **Warnings/Cleaning**: `#FFC107` (Yellow) - Indicates warning states and cleaning status
- **Standby**: `#0072CE` (Light Metro Blue) - Indicates vehicles in standby mode

## Components Updated with KMRL Theme

### 1. Sidebar Navigation
- **Background**: Deep Metro Blue (#003A8F)
- **Active Tab**: KMRL Red (#E31E24)
- **Hover State**: Semi-transparent white overlay
- **Icons**: Train icon in KMRL Red, Ship icon in Light Metro Blue
- **User info panel**: Semi-transparent white background

### 2. Login Page
- **Background Gradient**: Deep Metro Blue (#003A8F) gradient
- **Header**: KMRL Red (#E31E24) to Dark Red (#B71C1C) gradient
- **Primary Button**: KMRL Red (#E31E24) with Dark Red (#B71C1C) hover
- **Input Focus**: KMRL Red (#E31E24) border with subtle shadow
- **Demo Account Cards**: Light Grey (#F2F2F2) with KMRL Red accent on hover

### 3. Admin Dashboard
- **Page Title**: Deep Metro Blue (#003A8F)
- **Stat Cards**: White backgrounds with colored icon backgrounds
  - Metro trains: KMRL Red accent
  - Water boats: Light Metro Blue accent
  - Passengers: Green accent
  - Revenue: Green accent
- **Status Progress Bars**: Dynamic colors based on operational status
- **System Performance Panel**: Deep Metro Blue to Light Metro Blue gradient

### 4. Status Indicators
All status badges and progress bars follow the operational status color scheme:
- **Service**: Green (#28A745)
- **Maintenance**: KMRL Red (#E31E24)
- **Cleaning**: Yellow (#FFC107)
- **Ready**: Green (#28A745)
- **Standby**: Light Metro Blue (#0072CE)

### 5. Notifications
- **Success**: Green with light background
- **Error**: KMRL Red with light background
- **Info**: Light Metro Blue with light background

## Color Usage Guidelines

### Do's
✓ Use KMRL Red (#E31E24) for all primary actions and CTAs
✓ Use Deep Metro Blue (#003A8F) for headers and navigation
✓ Use operational status colors consistently across all modules
✓ Maintain sufficient contrast ratios for accessibility
✓ Use Light Grey (#F2F2F2) for subtle backgrounds and panels

### Don'ts
✗ Never use purple, violet, or indigo unless specifically requested
✗ Don't mix KMRL theme colors with arbitrary color choices
✗ Avoid using generic blue colors instead of the official KMRL blues
✗ Don't use bright, saturated colors that conflict with the professional metro theme

## Implementation Details

All KMRL colors are defined in `/src/lib/colors.ts`:

```typescript
export const KMRL_COLORS = {
  primary: '#E31E24',           // KMRL Red
  primaryDark: '#B71C1C',       // Dark Red
  metroBlue: '#003A8F',         // Deep Metro Blue
  lightBlue: '#0072CE',         // Light Metro Blue
  white: '#FFFFFF',             // White
  lightGrey: '#F2F2F2',         // Light Grey
  darkGrey: '#333333',          // Dark Grey

  status: {
    ready: '#28A745',           // Green
    service: '#28A745',         // Green
    maintenance: '#E31E24',     // KMRL Red
    cleaning: '#FFC107',        // Yellow
    standby: '#0072CE',         // Light Metro Blue
  }
};
```

Helper functions are available:
- `getStatusColor(status)` - Returns the appropriate color for a given status
- `getStatusBg(status)` - Returns a light background color for status indicators

## Professional Metro Control Room Appearance

The KMRL theme creates a professional, government-approved transport control center appearance suitable for:
- Professional hackathon demonstrations
- Client presentations
- Operational simulations
- Training environments
- Production deployment

The color scheme reflects the official branding of Kochi Metro Rail Limited while maintaining high usability and professional aesthetics expected in a modern metro operations control system.

---

**Last Updated**: February 2026
**Theme Version**: 1.0
**Compatible with**: KO-NECT Metro Operations Control System v1.0
