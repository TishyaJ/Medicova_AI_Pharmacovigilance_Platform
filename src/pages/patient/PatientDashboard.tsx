import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientLayout from '@/components/patient/PatientLayout';
import DashboardView from '@/components/patient/DashboardView';
import HistoryPanelView from '@/components/patient/HistoryPanelView';
import MedicinesView from '@/components/patient/MedicinesView';
import ProfileView from '@/components/patient/ProfileView';
import HelpView from '@/components/patient/HelpView';
import OnboardingWizard from '@/components/patient/OnboardingWizard';
import { useAuth } from '@/context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if profile is complete
    const checkProfileStatus = () => {
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          // If profile exists but not complete, show wizard
          if (!profile.profile_complete) {
            setShowOnboarding(true);
          }
        } catch (e) {
          console.error("Error parsing profile", e);
        }
      } else {
        // No profile at all -> show wizard
        setShowOnboarding(true);
      }
    };

    checkProfileStatus();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Optional: Force a reload or context update if needed
    window.location.reload();
  };

  return (
    <>
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <PatientLayout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/history" element={<HistoryPanelView />} />
          <Route path="/medicines" element={<MedicinesView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/help" element={<HelpView />} />
        </Routes>
      </PatientLayout>
    </>
  );
};

export default PatientDashboard;