import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardView from '@/components/admin/DashboardView';
import UsersView from '@/components/admin/UsersView';
import AnalyticsView from '@/components/admin/AnalyticsView';

const AdminDashboardNew = () => {
    return (
        <Routes>
            <Route index element={<DashboardView />} />
            <Route path="users" element={<UsersView />} />
            <Route path="analytics" element={<AnalyticsView />} />
            <Route path="doctors" element={
                <div className="p-8 text-center text-muted-foreground">
                    <p>Doctors management view coming soon...</p>
                </div>
            } />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};

export default AdminDashboardNew;
