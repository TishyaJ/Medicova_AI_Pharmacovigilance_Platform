# Admin Dashboard - Architecture Guide

## 🎯 Philosophy: "Bird's Eye vs. Deep Dive"

The new Admin Dashboard follows a **Hierarchical Intelligence Model** to prevent cognitive overload while providing deep insights when needed.

---

## 📊 Structure Overview

### 1. **Main Dashboard (Bird's Eye View)**
**Goal**: Instant situational awareness. No deep digging required.

#### Top KPI Cards (The "Pulse")
- **Critical Alerts**: Big red number showing Level 5 cases requiring immediate action
- **System Load**: Total active cases in last 24 hours
- **Bottlenecks**: Cases stuck with doctors for more than 24 hours
- **Safety Score**: Calculated index (0-100) indicating overall system health

#### Live Activity Feed
Real-time ticker showing:
- New Level 5 reports with location
- Case resolutions by doctors
- Stock alerts
- System notifications

Color-coded by urgency:
- 🔴 Red: Critical alerts
- 🟡 Yellow: Warnings
- 🟢 Green: Success events
- 🔵 Blue: Info updates

#### Trend Chart
Simple 7-day line chart showing:
- **Incoming Reports** (Red line)
- **Resolved Cases** (Green line)

**Alert Logic**: If Incoming > Resolved, system shows warning banner.

---

### 2. **User Management Panel** (Side Panel - Right)
**Goal**: Stakeholder management with rich profiles.

#### Access
Click "User Management" button in header to open side panel.

#### Three Tabs
1. **Doctors** 👨‍⚕️
2. **Pharmacists** 💊
3. **Patients** 👤

#### List View Features
- Avatar with name
- Role-specific subtitle (specialization, shop name, age)
- Status badge (Active/Pending/Flagged)
- Search functionality
- Hover effects for better UX

#### Profile Modal (Click any user)

**For Doctors:**
- Header: Photo, License ID, Specialization, Hospital
- Stats Cards:
  - Cases Assigned
  - Cases Reviewed
  - Average Resolution Time
- Recent Reviews: Scrollable list of last 5 cases

**For Pharmacists:**
- Header: Shop Name, License, Location
- Stats Cards:
  - Stock Requests
  - Adverse Events Reported
- Recent Stock Demands: List of medicine requests

**For Patients:**
- Header: Demographics (Age, Gender, Location)
- Risk Level Badge
- **Medical Timeline**: Vertical timeline showing:
  - Report history with dates
  - Color-coded severity (Red=High, Yellow=Medium, Green=Low)
  - Chronological order (newest first)

---

### 3. **Analytics Panel** (Side Panel - Right)
**Goal**: Deep dive into data patterns and trends.

#### Access
Click "Analytics" button in header to open side panel.

#### Components

**1. Risk Distribution Pie Chart**
- Shows case distribution by severity
- Categories: Low Risk, Medium Risk, High Risk, Critical
- Color-coded for quick recognition

**2. Regional Heatmap**
- Interactive map of India
- Hotspots show case clusters
- Click regions to drill down (future enhancement)
- Legend shows:
  - Red dots: High incidence areas (>40 cases)
  - Yellow dots: Emerging signals (20-40 cases)

**3. Top Flagged Medicines**
- List of medicines with highest adverse events
- For each medicine:
  - Name and event count
  - Trend indicator (↑ Increasing / → Stable / ↓ Decreasing)
  - Confidence score with progress bar
  - Color-coded by risk level

---

## 🎨 Design Principles

### Color System
- **Red (#ef4444)**: Critical alerts, high risk, urgent actions
- **Yellow (#facc15)**: Warnings, medium risk, attention needed
- **Green (#22c55e)**: Success, resolved, low risk
- **Blue (#3b82f6)**: Information, system status
- **Gray**: Neutral, inactive states

### Layout Strategy
- **Main view**: Clean, minimal, high-level overview
- **Side panels**: Detailed information without leaving context
- **Modals**: Deep dives into individual entities

### Interaction Patterns
- **Hover**: Subtle background change, scale effects
- **Click**: Opens relevant panel or modal
- **Search**: Real-time filtering
- **Badges**: Quick status recognition

---

## 🚀 Usage Scenarios

### Scenario 1: Morning Check-in
1. Admin logs in
2. Sees 4 KPI cards at a glance
3. Notices 23 critical alerts (red card)
4. Checks live feed for recent Level 5 reports
5. Takes immediate action

### Scenario 2: Doctor Performance Review
1. Click "User Management"
2. Go to "Doctors" tab
3. Search for specific doctor
4. Click to open profile modal
5. Review stats: Cases assigned vs. reviewed
6. Check average resolution time
7. Scroll through recent reviews

### Scenario 3: Regional Analysis
1. Click "Analytics"
2. View regional heatmap
3. Notice red hotspot in Maharashtra
4. Click region (future: drill down to see specific cases)
5. Cross-reference with medicine risk data

### Scenario 4: Medicine Safety Alert
1. Check "Top Flagged Medicines" in Analytics
2. See "MedX-500" with 124 events, trending up
3. Note 98% confidence score
4. Initiate investigation or recall process

---

## 📱 Responsive Design

- **Desktop**: Full layout with side panels
- **Tablet**: Stacked layout, panels become full-screen overlays
- **Mobile**: Single column, touch-optimized interactions

---

## 🔮 Future Enhancements

1. **Drill-down Heatmap**: Click regions to see case details
2. **Real-time Updates**: WebSocket integration for live feed
3. **Export Reports**: Download analytics as PDF/Excel
4. **Custom Dashboards**: Admin can configure KPI cards
5. **Notification System**: Push alerts for critical events
6. **Batch Actions**: Select multiple users for bulk operations
7. **Advanced Filters**: Filter by date range, region, severity
8. **Predictive Analytics**: AI-powered trend forecasting

---

## 🛠️ Technical Implementation

### Components
- `AdminDashboardNew.tsx`: Main dashboard component
- `UserProfileModal.tsx`: Reusable profile modal for all user types

### State Management
- Local state for panel visibility
- Selected user state for modal
- Search and filter states

### Data Flow
- Mock data for prototype
- Ready for API integration
- Structured for real-time updates

### Libraries Used
- Recharts: Charts and graphs
- Shadcn/UI: UI components
- Lucide React: Icons
- Tailwind CSS: Styling

---

## 📝 Testing Checklist

- [ ] All KPI cards display correct data
- [ ] Live feed updates in real-time
- [ ] Trend chart shows warning when needed
- [ ] User Management panel opens/closes smoothly
- [ ] All three user tabs (Doctors, Pharmacists, Patients) work
- [ ] Search filters users correctly
- [ ] Profile modals open with correct data
- [ ] Doctor profile shows all stats and recent reviews
- [ ] Pharmacist profile shows stock data
- [ ] Patient profile shows medical timeline
- [ ] Analytics panel opens/closes smoothly
- [ ] Pie chart renders correctly
- [ ] Heatmap displays with hotspots
- [ ] Medicine risk list shows trends
- [ ] Responsive design works on mobile
- [ ] All hover effects work
- [ ] Color coding is consistent

---

## 🎓 Best Practices

1. **Keep main view clean**: Only essential KPIs
2. **Use side panels for details**: Prevents clutter
3. **Color code consistently**: Red=urgent, Green=good
4. **Provide context**: Tooltips and descriptions
5. **Enable quick actions**: One-click access to common tasks
6. **Show trends, not just numbers**: Help admins make decisions
7. **Make it scannable**: Use visual hierarchy
8. **Optimize for speed**: Fast load times, smooth animations

---

## 📞 Support

For questions or enhancements, refer to:
- `action.md`: Detailed change log
- `QUICK_START.md`: Setup instructions
- Backend API docs: `http://localhost:8000/docs`
