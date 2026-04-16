# KO-NECT Metro Operations Control System

A comprehensive AI-powered metro operations control system for managing both metro trains and water metro boats in Kochi, Kerala. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Overview

KO-NECT (Kochi Operations - Network and Control Technology) is a professional-grade operations management system designed for the Kochi Metro Rail Limited (KMRL) to manage both their metro train and water metro fleets. The system features AI-powered operational planning, real-time fleet monitoring, certificate tracking, ridership analytics, and comprehensive reporting capabilities.

## Features

### Admin Dashboard
- **Fleet Overview**: Real-time monitoring of 100 vehicles (25 metro trains + 75 water boats)
- **AI Operational Planning**: Generate AI-powered operational plans with 92%+ confidence
- **Manual Override**: Full admin control to edit and override AI suggestions
- **Fleet Management**: Complete vehicle status tracking and management
- **Issue Inbox**: View and acknowledge employee-reported issues with photos
- **Reports & Analytics**: Comprehensive operational reports and analytics
- **History**: 30 days of downloadable operational history
- **Route Maps**: Interactive metro and water route visualization

### Employee Dashboard (Metro & Water)
- **Personal Fleet View**: Assigned vehicles dashboard by type
- **Status Updates**: Update vehicle status in real-time
- **Issue Reporting**: Report issues with photo attachment support
- **Operational Plans**: View and execute approved admin plans
- **History**: 7 days of downloadable operational history
- **Route Maps**: Relevant route maps for metro or water operations

### AI Features
- **Demand Prediction**: Analyze ridership data for demand forecasting
- **Maintenance Scheduling**: Proactive maintenance recommendations
- **Operational Optimization**: Smart vehicle deployment suggestions
- **Certificate Monitoring**: Alert system for expiring certificates

## Fleet Composition

### Metro Trains (25 Real Kochi Metro Names)
KRISHNA, TAPTI, NILA, SARAYU, ARUTH, VAIGAI, JHANAVI, DHWANIL, BHAVANI, PADMA, MANDAKINI, YAMUNA, PERIYAR, KABANI, VAAYU, KAVERI, SHIRIYA, PAMPA, NARMADA, MAHE, MAARUT, SABARMATHI, GODHAVARI, GANGA, PAVAN

### Water Metro Boats (75 Vessels)
WMB-001 through WMB-075, named after various Kochi locations and landmarks

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with KMRL official color theme
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom demo authentication with Supabase database
- **Build Tool**: Vite

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Demo Accounts

The system comes with three pre-configured demo accounts:

### Admin Account
- Email: `admin@konect.com`
- Password: `admin123`
- Access: Full system access, AI planning, fleet management, issue inbox, reports

### Metro Employee Account
- Email: `metro@konect.com`
- Password: `metro123`
- Access: 25 metro trains, status updates, issue reporting, history

### Water Employee Account
- Email: `water@konect.com`
- Password: `water123`
- Access: 75 water boats, status updates, issue reporting, history

## Demo Data

The system comes pre-populated with realistic demo data:

- **100 Vehicles**: Mixed operational statuses (service, maintenance, cleaning, standby, ready)
- **400 Certificates**: Safety, fitness, pollution, and insurance certificates with expiry tracking
- **390+ Ridership Records**: Last 3 days of passenger and revenue data
- **39+ Plan History**: 30 days of operational history
- **21+ AI Reports**: 14 days of AI-generated insights
- **Issues**: Sample issues with descriptions

## KMRL Official Color Theme

The system uses the official KMRL color scheme:

- **Primary Red**: #E31E24 (buttons, alerts, highlights)
- **Dark Red**: #B71C1C (hover states, emphasis)
- **Metro Blue**: #003A8F (sidebar, headers, navigation)
- **Light Blue**: #0072CE (links, secondary elements)
- **Status Colors**:
  - Green #28A745 (service, ready)
  - Red #E31E24 (maintenance, critical)
  - Yellow #FFC107 (cleaning, warnings)
  - Blue #0072CE (standby)

## AI Operational Planning Workflow

1. **Admin Generates AI Plan**: Click "Generate AI Plan" to analyze fleet status
2. **AI Analysis**: System analyzes 100 vehicles, maintenance schedules, certificates, ridership
3. **Smart Recommendations**: AI suggests optimal vehicle assignments
4. **Manual Override**: Admin can edit any suggestion
5. **Plan Approval**: Admin approves and sends plan to employees
6. **Employee Execution**: Employees receive and execute assignments
7. **History Tracking**: All plans saved to operational history

## Issue Reporting System

1. **Employee Reports Issue**: Describe problem, attach photo (optional)
2. **Issue Submission**: Saved to database with timestamp
3. **Admin Views**: Issue appears in admin inbox
4. **Admin Acknowledges**: Mark as acknowledged or resolved
5. **No Reply Feature**: One-way communication as specified

## Database Schema

### Key Tables
- `users`: Admin and employee accounts
- `vehicles`: 100 vehicles with status tracking
- `certificates`: Vehicle certificates with expiry dates
- `ridership_data`: Passenger and revenue data
- `operational_plans`: AI-generated and approved plans
- `plan_history`: Historical operational records
- `ai_reports`: AI analysis and insights
- `issues`: Employee-reported issues
- `vehicle_updates`: Status change tracking

## Project Structure

```
/src
  /components
    /admin              # Admin dashboard components
      AdminDashboard.tsx
      AIPlanning.tsx
      FleetManagement.tsx
      IssueInbox.tsx
      Reports.tsx
      History.tsx
      RouteMap.tsx
    /employee           # Employee dashboard components
      EmployeeDashboard.tsx
      UpdateStatus.tsx
      ReportIssue.tsx
      EmployeeHistory.tsx
      EmployeeRouteMap.tsx
    LoginPage.tsx       # Authentication
    Sidebar.tsx         # Navigation
    Notification.tsx    # Toast notifications
  /contexts
    AuthContext.tsx     # Authentication state management
  /lib
    supabase.ts        # Supabase client and types
    colors.ts          # KMRL color theme
  App.tsx              # Main application
  main.tsx             # Entry point
```

## Environment Variables

The `.env` file contains Supabase configuration:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are pre-configured for the demo environment.

## Build & Deployment

```bash
# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Notes

- All data persists in Supabase database
- Row Level Security (RLS) enabled on all tables
- Real-time updates using Supabase queries
- Responsive design for mobile, tablet, and desktop
- Professional government control room appearance

## Hackathon Demo Flow

1. **Login as Admin** (`admin@konect.com` / `admin123`)
   - View fleet dashboard with 100 vehicles
   - Check certificate alerts
   - Review ridership analytics

2. **Generate AI Plan**
   - Navigate to AI Planning tab
   - Click "Generate AI Plan"
   - Review AI suggestions for all vehicles
   - Edit any assignments manually
   - Approve and send to employees

3. **Login as Metro Employee** (`metro@konect.com` / `metro123`)
   - View 25 assigned metro trains
   - See operational plan from admin
   - Update vehicle statuses
   - Report an issue with photo

4. **Login as Water Employee** (`water@konect.com` / `water123`)
   - View 75 assigned water boats
   - Check vessel statuses
   - Update statuses as needed

5. **Back to Admin**
   - View reported issues in Issue Inbox
   - Acknowledge issues
   - Download operational history (30 days)
   - Review reports and analytics

## Support

For questions or issues, please refer to the project documentation or contact the development team.

## License

This project is developed for Kochi Metro Rail Limited (KMRL) operations management.
