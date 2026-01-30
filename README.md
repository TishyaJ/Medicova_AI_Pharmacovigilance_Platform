# Medicova - AI-Powered Pharmacovigilance Platform

## 🏥 Project Overview
Medicova (formerly Medicircle Connect) is an AI-powered Pharmacovigilance platform designed to bridge the gap between patients, doctors, and pharmacists. It features a modern, accessible interface with real-time adverse event reporting, AI-powered risk assessment, and comprehensive case management.

## 🛠️ Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Python FastAPI + SQLModel
- **Database**: Neon DB (PostgreSQL)
- **UI Components**: Shadcn/UI (49+ components)
- **Icons**: Lucide React
- **Charts**: Recharts

## ✨ Key Features

### 👤 Patient Portal
- **Professional Dashboard**: KPI cards showing active cases, health score, and reports
- **Case Registration**: Multi-step wizard for reporting adverse drug reactions
- **Real-time Case Tracking**: View case status, doctor verdicts, and AI risk assessments
- **WhatsApp-style Communication**: Chat with doctors directly in case detail view
- **Medicine Marketplace**: Order medicines with prescription tracking
- **Complete Profile Management**: Medical history, allergies, emergency contacts
- **Quick Actions**: Book consultations, view medical profile, emergency contacts

### 👨‍⚕️ Doctor Dashboard
- **Case Queue Management**: Prioritized cases with AI severity analysis
- **Risk Level Indicators**: Visual risk scoring (1-5 scale)
- **Review & Verdict System**: Submit medical opinions and treatment recommendations
- **Patient Communication**: Direct messaging within case context

### 💊 Pharmacist Dashboard
- **Stock Management**: Track medicine inventory and stock levels
- **Adverse Event Reporting**: Register and track medication complaints
- **SOP Guidelines**: Access standard operating procedures
- **AI Assistant**: Get help with pharmacovigilance protocols

### 🔐 Admin Dashboard
- **Bird's Eye View**: KPI cards showing critical alerts, system load, safety scores
- **User Management**: CRM-style interface for managing doctors, pharmacists, patients
- **Advanced Analytics**: 
  - Regional Intelligence with interactive heatmap
  - Medicine Risk Analysis with safety profiles
  - Symptom word clouds and batch analysis
- **Real-time Activity Feed**: Live system updates with color-coded alerts

## 🚀 Quick Start

### Prerequisites
1. **Node.js** (v16 or higher)
2. **Python** (v3.9 or higher)
3. **Neon DB Account** with connection string

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform.git
   cd medicircle-connect
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file with your Neon DB connection string
   echo "DATABASE_URL=your_neon_db_connection_string" > .env
   
   # Run database migrations (if needed)
   python migrate_profile.py
   python migrate_message.py
   
   # Start backend server
   uvicorn main:app --reload --port 8000
   ```
   Backend will run at `http://localhost:8000`

3. **Frontend Setup**:
   ```bash
   # In the root folder
   npm install
   
   # Start development server
   npm run dev
   ```
   Frontend will run at `http://localhost:5173` (or similar)

### 🪟 Windows Quick Start
Use the provided batch file for easy backend startup:
```bash
# Double-click start_backend.bat
# Then run: npm run dev
```

## 📱 User Flows

### New Patient Registration
1. Go to signup → Select "Patient" role
2. Complete 9-step profile setup:
   - Mobile verification
   - Basic details (name, email, password)
   - Language selection
   - Consent
   - Age, gender, location
   - Medical history and allergies
3. Login → See full dashboard with mock data

### Reporting an Adverse Event
1. Dashboard → Click "Register New Case"
2. Complete multi-step wizard:
   - Medicine details (name, dosage, duration)
   - Side effects and severity
   - Upload evidence (optional)
   - Review and submit
3. Case created with AI risk assessment
4. Track case status in History Panel

### Doctor Review Process
1. Login as doctor
2. View prioritized case queue
3. Click case → Review patient details and symptoms
4. Submit verdict and recommendations
5. Patient receives notification

## 🗂️ Project Structure

```
medicircle-connect/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLModel database models
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── cases.py         # Case management endpoints
│   │   └── stats.py         # Statistics endpoints
│   ├── migrate_profile.py   # Profile schema migration
│   └── migrate_message.py   # Message schema migration
├── src/
│   ├── components/
│   │   ├── patient/         # Patient portal components
│   │   ├── admin/           # Admin dashboard components
│   │   ├── auth/            # Login/Signup components
│   │   └── ui/              # Shadcn/UI components
│   ├── pages/               # Main page components
│   ├── lib/
│   │   └── api.ts           # API client functions
│   └── context/
│       └── AuthContext.tsx  # Authentication state
├── action.md                # Detailed change log
└── README.md                # This file
```

## 🔑 Test Credentials

For testing without creating a new account:
- **Email**: test@example.com
- **Password**: test123
- **Phone**: 9876543210

## 🐛 Troubleshooting

### Backend won't start
- Ensure virtual environment is activated
- Check `.env` file has correct DATABASE_URL
- Run migrations: `python migrate_profile.py`

### Frontend shows "Failed to fetch"
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in `backend/main.py`

### Database errors
- Verify Neon DB connection string
- Run migration scripts in `backend/` folder
- Check database logs in Neon dashboard

## 📚 Documentation

- **Action Log**: See `action.md` for detailed change history
- **API Documentation**: Visit `http://localhost:8000/docs` when backend is running
- **Component Library**: Shadcn/UI documentation at https://ui.shadcn.com

## 🤝 Contributing

This is a private project. For access or collaboration inquiries, contact the project maintainer.

## 📄 License

Private Property of Medicova. All rights reserved.

## 🔗 Links

- **Repository**: https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform
- **Backend API**: http://localhost:8000 (development)
- **Frontend UI**: http://localhost:5173 (development)

---

**Last Updated**: 2026-01-31  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
