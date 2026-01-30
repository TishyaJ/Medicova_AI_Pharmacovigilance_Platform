import { Routes, Route } from 'react-router-dom';
import PatientLayout from '@/components/patient/PatientLayout';
import DashboardView from '@/components/patient/DashboardView';
import HistoryPanelView from '@/components/patient/HistoryPanelView';
import MedicinesView from '@/components/patient/MedicinesView';
import ProfileView from '@/components/patient/ProfileView';
import HelpView from '@/components/patient/HelpView';

const PatientDashboard = () => {
  // Always show the dashboard since profile setup is now done during signup
  return (
    <PatientLayout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/history" element={<HistoryPanelView />} />
        <Route path="/medicines" element={<MedicinesView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/help" element={<HelpView />} />
      </Routes>
    </PatientLayout>
  );
};

export default PatientDashboard;