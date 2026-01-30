# Medicova - Quick Start Guide

## 🚀 Running the Application

### Option 1: Frontend Only (Mock Data)
Perfect for testing UI and dashboards without backend.

```bash
npm run dev
```

Then visit: **http://localhost:8080/**

**To test dashboards:**
1. Click on Login tab
2. Select any role (Patient, Doctor, Pharmacist, Admin)
3. Enter any email/password (it's mocked)
4. Click Login - you'll be redirected to that role's dashboard

### Option 2: Full Stack (Frontend + Backend)

#### Terminal 1 - Frontend:
```bash
npm run dev
```

#### Terminal 2 - Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Or simply double-click:** `start_backend.bat`

---

## 🎨 What's New (Jan 30, 2025)

### Enhanced UI/UX:
- ✅ **Larger, clearer Login/Sign Up tabs** with better visual hierarchy
- ✅ **Improved accessibility** - keyboard navigation, screen reader support
- ✅ **Better error handling** - graceful fallback when backend is offline
- ✅ **Smooth animations** with reduced-motion support

### Testing the Dashboards:

**Patient Dashboard:**
- WhatsApp-style chat interface
- Report side effects, book consultations
- Multimodal input (text, voice, image)

**Doctor Dashboard:**
- Case queue with risk levels (Critical/Pending/History)
- Review and resolve patient cases
- AI-powered case analysis

**Pharmacist Dashboard:**
- Stock management with demand tracking
- Complaint registration forms
- AI SOP assistant

**Admin Dashboard:**
- KPI overview cards
- User management (CRM-style)
- Analytics with charts and heatmaps
- Medicine registry

---

## 🔧 Backend Setup (Optional)

Your backend is already configured with Neon DB! The `.env` file contains your database connection.

**Requirements:**
- Python 3.8+
- pip

**Installation:**
```bash
cd backend
pip install -r requirements.txt
```

**Run:**
```bash
uvicorn main:app --reload --port 8000
```

**Verify:** Visit http://localhost:8000/docs for API documentation

---

## 🐛 Troubleshooting

### "Registration Failed" error?
- This happens when backend is not running
- **Solution:** Use the Login tab instead (mock authentication works without backend)
- Or start the backend server

### Dependencies not installed?
```bash
npm install
```

### Port already in use?
- Frontend: Change port in `vite.config.ts`
- Backend: Use `uvicorn main:app --reload --port 8001`

---

## 📱 Testing Checklist

- [ ] Login page loads with clear tabs
- [ ] Can select different roles
- [ ] OTP flow works (code: 123456)
- [ ] Can access all 4 dashboards
- [ ] Mobile responsive design
- [ ] Keyboard navigation works
- [ ] Multi-language switcher works

---

## 🎯 Next Steps

1. Test all dashboards
2. Provide feedback on UI/UX
3. Identify specific features to enhance
4. Test with backend API integration

**Need help?** Check `action.md` for detailed change log.
