# 🧪 Medicova Testing Guide

## ✅ System Status

### Backend
- **URL**: http://localhost:8000
- **Status**: ✅ Running
- **Database**: ✅ Neon DB Connected
- **Tables**: ✅ All 6 tables created

### Frontend  
- **URL**: http://localhost:8081
- **Status**: ✅ Running
- **Framework**: React + Vite + TypeScript

---

## 🔐 Test Credentials

### Test Patient Account
- **Email**: `test@example.com`
- **Password**: `test123`
- **Phone**: `9876543210`
- **Profile**: ✅ Complete with 3 test cases

---

## 🧪 Testing Steps

### 1. Test Login (Existing User)
1. Go to http://localhost:8081
2. Click "Login" tab
3. Select "Patient" role
4. Enter:
   - Email: `test@example.com`
   - Password: `test123`
5. Click "Login"
6. ✅ Should redirect to patient dashboard with data

### 2. Test Dashboard
After logging in, you should see:
- ✅ Welcome banner with user name
- ✅ 4 KPI cards showing:
  - Active Cases: 1
  - Total Reports: 3
  - Pending Reviews: 1
  - Health Score: Good
- ✅ Recent activity feed with 3 items
- ✅ Quick actions buttons

### 3. Test Case History
1. Click "History Panel" in left sidebar
2. ✅ Should see 3 cases:
   - Dolo-650 (Pending)
   - Augmentin-625 (Reviewed)
   - Paracetamol (Reviewed)
3. Click any case card
4. ✅ Slide-over opens with WhatsApp-style chat

### 4. Test New Registration
1. Logout (if logged in)
2. Click "Sign Up" tab
3. Enter phone: Any 10 digits (e.g., `1234567890`)
4. Click "Get OTP" → Enter `123456` → Verify
5. Select "Patient" role
6. Fill in:
   - Name: Your name
   - Email: New email (e.g., `newuser@test.com`)
   - Password: Any password
7. Continue through 6 more steps:
   - Language selection
   - Consent
   - Age range
   - Gender
   - PIN code (6 digits)
   - Medical history (optional)
8. Click "Complete Registration"
9. ✅ Should show success message
10. Login with new credentials
11. ✅ Dashboard should be empty (no cases yet)

### 5. Test Case Creation
1. Click "Register New Case" button
2. Go through wizard:
   - Consent & Language
   - Medicine details
   - Symptoms
   - Severity
   - Evidence (optional)
   - Review & Submit
3. ✅ Case should be created
4. ✅ Dashboard stats should update
5. ✅ Case should appear in History Panel

---

## 🐛 Troubleshooting

### Backend Not Running
```bash
cd backend
.\venv\Scripts\Activate.ps1
py -m uvicorn main:app --reload
```

### Frontend Not Running
```bash
npm run dev
```

### Database Issues
```bash
cd backend
.\venv\Scripts\python.exe test_db_connection.py
```

### Reset Database (Clear all data)
```bash
cd backend
.\venv\Scripts\python.exe force_reset_db.py
.\venv\Scripts\python.exe create_test_user.py
.\venv\Scripts\python.exe create_test_cases.py
```

---

## 📊 Database Tables

1. **user** - All users (patients, doctors, pharmacists, admins)
2. **patientprofile** - Patient-specific data
3. **doctorprofile** - Doctor-specific data
4. **pharmacistprofile** - Pharmacist-specific data
5. **medicine** - Medicine catalog
6. **feedback** - Case reports/adverse events

---

## ✅ What's Working

- ✅ User registration with comprehensive patient profiles
- ✅ Login authentication against Neon DB
- ✅ Dynamic dashboard with real user stats
- ✅ Case history display with search/filter
- ✅ WhatsApp-style conversation in slide-over
- ✅ Case creation via multi-step wizard
- ✅ Real-time data loading from database
- ✅ Proper error handling and validation

---

## 🎯 Next Steps

1. Test all functionality with the test account
2. Create new accounts and test registration flow
3. Create cases and verify they appear correctly
4. Test navigation between all sections
5. Verify data persistence across sessions

---

## 📝 Notes

- OTP for testing is always: `123456`
- Backend logs show all SQL queries for debugging
- Frontend shows toast notifications for all actions
- All data is stored in Neon DB (persistent)
