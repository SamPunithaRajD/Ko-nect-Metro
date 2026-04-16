# KO-NECT Demo Guide

Quick reference guide for demonstrating the KO-NECT Metro Operations Control System.

## Quick Start

```bash
npm install
npm run dev
```

The application will start at `http://localhost:5173`

## Demo Credentials

### Admin
- **Email**: admin@konect.com
- **Password**: admin123

### Metro Employee
- **Email**: metro@konect.com
- **Password**: metro123

### Water Employee
- **Email**: water@konect.com
- **Password**: water123

## Complete Demo Flow (5-10 minutes)

### Part 1: Admin Overview (2-3 minutes)

1. **Login as Admin** with credentials above
2. **Dashboard View**:
   - Point out: 25 metro trains in service
   - Point out: 75 water boats total
   - Point out: Total passengers (last 3 days)
   - Point out: Revenue metrics
   - Point out: Certificate expiry alerts

3. **Fleet Management Tab**:
   - Show: All 100 vehicles with real names
   - Show: Filter by metro trains (KRISHNA, TAPTI, etc.)
   - Show: Filter by water boats
   - Show: Status indicators (service, maintenance, ready, etc.)
   - Demonstrate: Quick search functionality

### Part 2: AI Planning Demo (3-4 minutes)

4. **Navigate to AI Planning Tab**
5. **Click "Generate AI Plan"**:
   - Show: AI analyzing progress (2-3 second animation)
   - Show: 92%+ confidence score
   - Show: All 100 vehicles listed with suggestions
6. **Demonstrate Manual Override**:
   - Click "Edit Mode"
   - Change status of any vehicle (e.g., KRISHNA from service to maintenance)
   - Show how admin has full control
7. **Approve Plan**:
   - Click "Approve & Send to Employees"
   - Show success notification
   - Explain: Employees now receive this plan

### Part 3: Issue Management (1-2 minutes)

8. **Navigate to Issue Inbox**:
   - Show: Sample reported issues
   - Click on an issue to view details
   - Show: Photo attachments (if present)
   - Click "Acknowledge Issue"
   - Explain: One-way communication system

### Part 4: Reports & History (1 minute)

9. **Navigate to Reports Tab**:
   - Show: AI-generated insights
   - Show: Operational efficiency metrics
   - Show: Maintenance predictions

10. **Navigate to History Tab**:
    - Show: 30 days of operational history
    - Click "Download History (PDF)" button
    - Explain: Full audit trail for compliance

### Part 5: Employee View (2-3 minutes)

11. **Logout and Login as Metro Employee**
12. **Employee Dashboard**:
    - Show: Only metro trains visible (25 vehicles)
    - Show: Assigned vehicles: KRISHNA, TAPTI, NILA, etc.
    - Show: Status breakdown (in service, maintenance, etc.)

13. **Update Status Tab**:
    - Select a vehicle (e.g., KRISHNA)
    - Change status from "service" to "maintenance"
    - Add notes: "Scheduled brake system inspection"
    - Click "Update Status"
    - Show success notification

14. **Report Issue Tab**:
    - Select a vehicle
    - Enter issue description: "Minor AC malfunction in coach 2"
    - Optionally add photo URL or base64
    - Submit issue
    - Show success notification

15. **Employee History**:
    - Show: 7 days of history available
    - Click download to get employee's operational log

### Part 6: Water Metro (1 minute)

16. **Logout and Login as Water Employee**
17. **Quick View**:
    - Show: 75 water boats assigned
    - Show: Different interface styling (water theme)
    - Show: Same functionality as metro employee

### Part 7: Route Maps (Optional)

18. **Navigate to Route Maps** (in any dashboard):
    - Show: Metro route visualization
    - Show: Water metro route visualization
    - Explain: Interactive maps for operational planning

## Key Highlights to Emphasize

### Technical Excellence
- 100% functional with real database
- 100 vehicles pre-loaded with realistic data
- Real metro train names from Kochi Metro
- Professional KMRL color theme
- AI-powered operational planning
- Comprehensive history tracking

### Real-World Application
- Solves actual KMRL operational challenges
- Demand prediction using ridership data
- Proactive maintenance scheduling
- Certificate expiry management
- Multi-level user access control

### Scalability
- Built with production-ready tech stack
- Supabase backend for real-time updates
- Row Level Security for data protection
- Clean, maintainable codebase
- Responsive design for all devices

## Common Demo Questions & Answers

**Q: Is the data real?**
A: The vehicle names are real Kochi Metro trains. The operational data is realistic demo data designed for hackathon presentation.

**Q: How does AI planning work?**
A: The AI analyzes vehicle status, maintenance schedules, certificate expiry dates, and ridership data to optimize fleet deployment.

**Q: Can the system handle more vehicles?**
A: Yes, the architecture scales easily. The current 100 vehicles demonstrate the system's capabilities.

**Q: How is security handled?**
A: Row Level Security (RLS) is enabled on all Supabase tables. Employees can only access their assigned vehicles.

**Q: What about real-time updates?**
A: The system uses Supabase for real-time data synchronization across all users.

## Troubleshooting

### Issue: Login not working
- **Solution**: Verify you're using the exact credentials (lowercase)
- Check: admin@konect.com (not Admin@konect.com)

### Issue: Dashboard shows no data
- **Solution**: Database should be pre-populated. Check Supabase connection in .env

### Issue: Build errors
- **Solution**: Run `npm install` again to ensure all dependencies are installed

### Issue: Port already in use
- **Solution**: Change port in vite.config.ts or kill process on port 5173

## Post-Demo Actions

After the demo, you can:
1. Show the codebase structure
2. Explain the Supabase schema
3. Demonstrate the build process
4. Discuss scalability and deployment options
5. Review the KMRL color theme implementation

## Demo Tips

- **Practice the flow** at least once before presenting
- **Keep demo data ready**: Have vehicle names memorized (KRISHNA, TAPTI, etc.)
- **Prepare for questions**: Know the tech stack and architecture
- **Show confidence**: The system is fully functional
- **Emphasize real-world value**: This solves actual KMRL problems

## Timing Recommendations

- **Short Demo (5 min)**: Parts 1, 2, 5 (Admin overview, AI planning, one employee view)
- **Medium Demo (10 min)**: Parts 1-5 (Add issues and reports)
- **Full Demo (15 min)**: All parts including route maps and detailed explanations

Good luck with your presentation!
