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
    Shield,
    User,
    Pill,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, casesAPI } from '@/lib/api';
import CaseWizard from './CaseWizard';
import BookConsultationDialog from './BookConsultationDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DashboardView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<any>(null);
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
            if (!user?.id) {
                console.log('No user ID found:', user);
                setLoading(false);
                return;
            }

            console.log('Loading dashboard data for user:', user.id);

            try {
                const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

                // Load user stats
                const userStats = await statsAPI.getUserStats(userId);
                console.log('User stats loaded:', userStats);
                setStats(userStats);

                // Load recent cases for activity
                const cases = await casesAPI.getUserCases(userId);
                console.log('User cases loaded:', cases);

                // Filter to only show pending and escalated cases (exclude 'reviewed'), then sort by date descending (latest first)
                const filteredAndSortedCases = cases
                    .filter((caseItem: any) => caseItem.status !== 'reviewed')
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                const activity = filteredAndSortedCases.slice(0, 3).map((caseItem: any) => ({
                    id: caseItem.id,
                    type: caseItem.status === 'pending' ? 'case_created' :
                        caseItem.status === 'reviewed' ? 'case_update' : 'case_closed',
                    message: caseItem.status === 'pending' ?
                        `New case registered for ${caseItem.medicine_name}` :
                        caseItem.status === 'reviewed' ?
                            `Doctor reviewed your ${caseItem.medicine_name} case` :
                            `${caseItem.medicine_name} case marked as resolved`,
                    time: caseItem.last_update,
                    status: caseItem.status,
                    medicine: caseItem.medicine_name,
                    symptom: caseItem.symptoms,
                    caseNumber: caseItem.case_number || `CASE-${caseItem.id}`,
                    doctorVerdict: caseItem.doctor_verdict || (caseItem.status === 'reviewed' ? 'Doctor has reviewed this case. Please check details.' : null)
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

    const handleCaseClick = (caseData: any) => {
        // Navigate to history with case selected
        navigate('/patient/history', { state: { selectedCaseId: caseData.id } });
    };

    const handleNewCaseSubmit = async (caseData: any) => {
        if (!user?.id) return;

        try {
            const numericUserId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            const result = await casesAPI.createCase({
                medicine_name: caseData.medicine,
                symptoms: caseData.symptoms,
                user_id: numericUserId,
                wizard_data: {
                    severity: caseData.severity,
                    duration: caseData.duration,
                    dosage: caseData.dosage,
                    prescriber: caseData.prescriber,
                    additionalNotes: caseData.additionalNotes
                }
            });

            toast.success(`Case ${result.case_number} created successfully!`);

            // Reload dashboard data
            const userStats = await statsAPI.getUserStats(numericUserId);
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
                            Welcome back, {user?.full_name || user?.name || 'Patient'}
                        </h1>
                        <p className="text-muted-foreground">
                            {loading ? 'Loading your case information...' :
                                `You have ${stats.activeCases} active cases and ${stats.pendingReviews} pending reviews.`}
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

            {/* My Active Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">My Active Cases</h2>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                View All
                            </Button>
                        </div>

                        {recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <Card key={activity.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCaseClick(activity)}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg mb-1">{activity.medicine}</h4>
                                                    <p className="text-sm text-muted-foreground">Case #{activity.caseNumber}</p>
                                                </div>
                                                <Badge
                                                    variant={activity.status === 'urgent' ? 'destructive' : 'secondary'}
                                                    className="ml-2"
                                                >
                                                    {activity.status === 'urgent' ? 'Urgent' : 'Pending'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Activity className="h-4 w-4 text-purple-600" />
                                                    <span className="text-muted-foreground">AI Review:</span>
                                                    <span className="font-medium">
                                                        Risk Level {activity.riskLevel}/5
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 text-green-600" />
                                                    <span className="text-muted-foreground">Doctor's Verdict:</span>
                                                    <span className="font-medium">
                                                        {activity.doctorVerdict ? 'Received' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            {activity.doctorVerdict && (
                                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-green-900 dark:text-green-100">
                                                        <span className="font-semibold">Verdict: </span>
                                                        {activity.doctorVerdict}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {activity.doctorVerdict ? (
                                                    <>
                                                        <Button size="sm" variant="outline" className="flex-1">
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Close Case
                                                        </Button>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={(e) => { e.stopPropagation(); navigate('/patient/medicines'); }}>
                                                            <Pill className="h-4 w-4 mr-1" />
                                                            Book Medicine
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="flex-1">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            Follow-up
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button size="sm" variant="outline" className="w-full" disabled>
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        Awaiting Doctor Review
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium text-lg text-muted-foreground">No active cases</h3>
                                    <p className="text-sm text-muted-foreground/80 mb-6 max-w-xs mx-auto">Report your first side effect to get started with your personalized health tracking.</p>
                                    <Button variant="outline" onClick={() => setIsWizardOpen(true)}>Register a Case</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <Button
                                    variant="outline"
                                    className="justify-start h-12 w-full"
                                    onClick={() => navigate('/patient/history')}
                                >
                                    <FileText className="h-4 w-4 mr-3" />
                                    View All Cases
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start h-12 w-full"
                                    onClick={() => navigate('/patient/profile')}
                                >
                                    <Activity className="h-4 w-4 mr-3" />
                                    Medical Profile
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start h-12 w-full"
                                    onClick={() => setIsConsultationDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-3" />
                                    Book Consultation
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start h-12 w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={() => toast.info('Emergency: Call 102 (Ambulance) or 108 (Emergency)')}
                                >
                                    <Shield className="h-4 w-4 mr-3" />
                                    Emergency Contacts
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                            <div className="text-2xl font-bold text-green-600 mb-2">
                                {loading ? '...' : recentActivity.filter(a => a.status === 'urgent').length}
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">Critical Reactions</p>
                            <p className="text-xs text-muted-foreground mt-1">Active cases</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                {loading ? '...' : recentActivity.filter(a => a.status === 'pending').length}
                            </div>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Mild Reactions</p>
                            <p className="text-xs text-muted-foreground mt-1">Pending review</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                                {loading ? '...' : stats.healthScore}
                            </div>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Safety Score</p>
                            <p className="text-xs text-muted-foreground mt-1">Based on reports</p>
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

            {/* Book Consultation Dialog */}
            <BookConsultationDialog
                isOpen={isConsultationDialogOpen}
                onClose={() => setIsConsultationDialogOpen(false)}
            />
        </div>
    );
};

export default DashboardView;