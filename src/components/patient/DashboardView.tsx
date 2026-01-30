import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    AlertTriangle,
    Activity,
    FileText,
    Clock,
    CheckCircle,
    TrendingUp,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, casesAPI } from '@/lib/api';
import CaseWizard from './CaseWizard';
import { toast } from 'sonner';

const DashboardView = () => {
    const { user } = useAuth();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [stats, setStats] = useState({
        activeCases: 0,
        totalReports: 0,
        pendingReviews: 0,
        healthScore: 'Loading...'
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user?.id) return;

            try {
                // Load user stats
                const userStats = await statsAPI.getUserStats(user.id);
                setStats(userStats);

                // Load recent cases for activity
                const cases = await casesAPI.getUserCases(user.id);
                const activity = cases.slice(0, 3).map((case: any) => ({
                    id: case.id,
                    type: case.status === 'pending' ? 'case_created' : 
                          case.status === 'reviewed' ? 'case_update' : 'case_closed',
                    message: case.status === 'pending' ?
                        `New case registered for ${case.medicine_name
                }` :
                             case.status === 'reviewed' ?
                             `Doctor reviewed your ${case.medicine_name } case ` :
                             `${case.medicine_name } case marked as resolved`,
                    time: case.last_update,
                    status: case.status
                }));
                setRecentActivity(activity);

            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user?.id]);

    const handleNewCaseSubmit = async (caseData: any) => {
        if (!user?.id) return;

        try {
            const result = await casesAPI.createCase({
                medicine_name: caseData.medicine,
                symptoms: caseData.symptoms,
                user_id: user.id
            });

            toast.success(`Case ${ result.case_number } created successfully!`);
            
            // Reload dashboard data
            const userStats = await statsAPI.getUserStats(user.id);
            setStats(userStats);

        } catch (error) {
            console.error('Failed to create case:', error);
            toast.error('Failed to create case');
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'case_update': return <Activity className="h-4 w-4 text-blue-600" />;
            case 'case_created': return <Plus className="h-4 w-4 text-orange-600" />;
            case 'case_closed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            default: return <FileText className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'closed': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome back, {user?.name || user?.full_name || 'Patient'}
                        </h1>
                        <p className="text-muted-foreground">
                            {loading ? 'Loading your case information...' : 
                             `You have ${ stats.activeCases } active cases and ${ stats.pendingReviews } pending reviews.`}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="bg-primary/10 rounded-full p-4">
                            <Activity className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Active Cases
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {loading ? '...' : stats.activeCases}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Total Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {loading ? '...' : stats.totalReports}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {loading ? '...' : stats.pendingReviews}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Health Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {loading ? '...' : stats.healthScore}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Based on reports</p>
                    </CardContent>
                </Card>
            </div>

            {/* Report New Side Effect */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="text-center sm:text-left">
                            <h3 className="text-lg font-semibold mb-1">Report a New Side Effect</h3>
                            <p className="text-muted-foreground text-sm">
                                Experienced any adverse reactions? Report them safely and get professional guidance.
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsWizardOpen(true)}
                            size="lg"
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-8"
                        >
                            <Plus className="h-5 w-5" />
                            Register New Case
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading recent activity...
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No recent activity. Report your first case to get started!
                                </div>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{activity.message}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                <Badge variant="outline" className={getStatusColor(activity.status)}>
                                                    {activity.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            <Button variant="outline" className="justify-start h-12">
                                <FileText className="h-4 w-4 mr-3" />
                                View All Cases
                            </Button>
                            <Button variant="outline" className="justify-start h-12">
                                <Activity className="h-4 w-4 mr-3" />
                                Update Medical Profile
                            </Button>
                            <Button variant="outline" className="justify-start h-12">
                                <Plus className="h-4 w-4 mr-3" />
                                Book Consultation
                            </Button>
                            <Button variant="outline" className="justify-start h-12">
                                <Shield className="h-4 w-4 mr-3" />
                                Emergency Contacts
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Health Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Health Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-600 mb-2">0</div>
                            <p className="text-sm text-green-700 dark:text-green-300">Critical Reactions</p>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Mild Reactions</p>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="text-2xl font-bold text-purple-600 mb-2">95%</div>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Safety Score</p>
                            <p className="text-xs text-muted-foreground mt-1">Above average</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* New Case Wizard */}
            <CaseWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSubmit={handleNewCaseSubmit}
            />
        </div>
    );
};

export default DashboardView;