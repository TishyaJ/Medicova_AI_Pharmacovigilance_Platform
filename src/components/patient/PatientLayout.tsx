import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    History,
    Pill,
    User,
    HelpCircle,
    Phone,
    Bell,
    LogOut,
    Activity,
    Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const PatientLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [notifications] = useState(2); // Mock notification count

    const sidebarItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/patient',
            description: 'Overview & Quick Actions'
        },
        {
            id: 'history',
            label: 'History Panel',
            icon: History,
            path: '/patient/history',
            description: 'My Case History & Conversations'
        },
        {
            id: 'medicines',
            label: 'Medicines',
            icon: Pill,
            path: '/patient/medicines',
            description: 'Order & Track Medicines'
        },
        {
            id: 'profile',
            label: 'My Profile',
            icon: User,
            path: '/patient/profile',
            description: 'Personal & Medical Information'
        },
        {
            id: 'help',
            label: 'Get Help',
            icon: HelpCircle,
            path: '/patient/help',
            description: 'Support & Emergency Contacts'
        }
    ];

    const handleEmergencyCall = () => {
        const shouldCall = window.confirm('This will call the emergency helpline (102). Continue?');
        if (shouldCall) {
            window.open('tel:102');
        }
    };

    const isActive = (path: string) => {
        if (path === '/patient') {
            return location.pathname === '/patient';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="bg-primary rounded-lg p-2">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-primary">MEDICOVA</h1>
                                <p className="text-xs text-muted-foreground">Patient Portal</p>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-4">
                            {/* Language Selector */}
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <Languages className="h-4 w-4" />
                                English
                            </Button>

                            {/* Emergency Button */}
                            <Button
                                variant="destructive"
                                onClick={handleEmergencyCall}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                            >
                                <Phone className="h-4 w-4" />
                                Emergency
                            </Button>

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {notifications > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                        {notifications}
                                    </Badge>
                                )}
                            </Button>

                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium">{user?.name || 'John Patient'}</p>
                                    <p className="text-xs text-muted-foreground">Patient ID: {user?.id || 'P001'}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={logout}>
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Left Sidebar */}
                <aside className="w-64 bg-white dark:bg-slate-900 border-r min-h-[calc(100vh-80px)] sticky top-20">
                    <div className="p-4">
                        <nav className="space-y-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                                            active
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{item.label}</p>
                                            <p className={cn(
                                                "text-xs truncate",
                                                active ? "text-primary-foreground/80" : "text-muted-foreground"
                                            )}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PatientLayout;