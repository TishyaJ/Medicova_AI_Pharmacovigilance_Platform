import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  MessageSquare,
  User,
  Phone,
  Pill,
  Users,
  FileText,
  BarChart3,
  Settings,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'patient':
        return [
          { icon: Home, label: 'Dashboard', path: '/patient' },
          { icon: MessageSquare, label: 'AI Assistant', path: '/patient/chat' },
          { icon: Pill, label: 'Medicines', path: '/patient/medicines' },
          { icon: User, label: 'My Profile', path: '/patient/profile' },
          { icon: Phone, label: 'Get Help', path: '/patient/help' },
        ];
      case 'doctor':
        return [
          { icon: Home, label: 'Dashboard', path: '/doctor' },
          { icon: ClipboardList, label: 'Patient Cases', path: '/doctor/cases' },
          { icon: Users, label: 'Patients', path: '/doctor/patients' },
          { icon: Settings, label: 'Settings', path: '/doctor/settings' },
        ];
      case 'pharmacist':
        return [
          { icon: Home, label: 'Dashboard', path: '/pharmacist' },
          { icon: Pill, label: 'Medicine Queries', path: '/pharmacist/queries' },
          { icon: FileText, label: 'Drug Info', path: '/pharmacist/drugs' },
          { icon: Settings, label: 'Settings', path: '/pharmacist/settings' },
        ];
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/admin' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
          { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col px-3 py-4">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
          <p className="text-xs font-medium text-foreground">Need Help?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact support for assistance
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
