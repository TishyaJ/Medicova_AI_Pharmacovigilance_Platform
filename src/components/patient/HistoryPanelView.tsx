import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Eye,
    Filter,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { casesAPI } from '@/lib/api';
import { toast } from 'sonner';
import CaseDetailSlideOver from './CaseDetailSlideOver';

interface CaseData {
    id: string;
    case_number: string;
    created_at: string;
    medicine_name: string;
    symptoms: string;
    status: 'pending' | 'reviewed' | 'closed' | 'urgent';
    severity_score: number;
    last_update: string;
    messageCount?: number;
    hasUnreadMessages?: boolean;
}

const HistoryPanelView = () => {
    const { user } = useAuth();
    const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [cases, setCases] = useState<CaseData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCases = async () => {
            if (!user?.id) return;

            try {
                const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
                const userCases = await casesAPI.getUserCases(userId);

                // Transform API data to match component interface
                const transformedCases = userCases.map((apiCase: any) => ({
                    id: apiCase.id.toString(),
                    case_number: apiCase.case_number,
                    created_at: apiCase.created_at,
                    medicine_name: apiCase.medicine_name,
                    symptoms: apiCase.symptoms,
                    status: apiCase.status === 'escalated' ? 'urgent' : apiCase.status,
                    severity_score: apiCase.severity_score,
                    last_update: apiCase.last_update,
                    messageCount: Math.floor(Math.random() * 15) + 3, // Mock message count
                    hasUnreadMessages: Math.random() > 0.7 // Mock unread status
                })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setCases(transformedCases);
            } catch (error) {
                console.error('Failed to load cases:', error);
                toast.error('Failed to load case history');
            } finally {
                setLoading(false);
            }
        };

        loadCases();
    }, [user?.id]);

    const handleCaseClick = (caseData: CaseData) => {
        // Transform to match CaseDetailSlideOver interface
        const transformedCase = {
            id: caseData.id,
            caseNumber: caseData.case_number,
            date: caseData.created_at,
            medicine: caseData.medicine_name,
            symptom: caseData.symptoms,
            status: caseData.status as 'pending' | 'reviewed' | 'closed' | 'urgent',
            riskLevel: Math.ceil(caseData.severity_score * 5) as 1 | 2 | 3 | 4 | 5,
            lastUpdate: caseData.last_update
        };
        setSelectedCase(transformedCase);
        setIsSlideOverOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'closed': return 'bg-green-100 text-green-800 border-green-200';
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'reviewed': return <Eye className="h-3 w-3" />;
            case 'closed': return <CheckCircle className="h-3 w-3" />;
            case 'urgent': return <AlertTriangle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const getRiskLevelColor = (severity_score: number) => {
        const riskLevel = Math.ceil(severity_score * 5);
        if (riskLevel >= 4) return 'text-red-600 bg-red-50 border-red-200';
        if (riskLevel >= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (riskLevel >= 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getRiskLevel = (severity_score: number) => {
        return Math.ceil(severity_score * 5);
    };

    // Filter cases based on search and status
    const filteredCases = cases.filter(caseData => {
        const matchesSearch =
            caseData.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            caseData.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            caseData.symptoms.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || caseData.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeCases = filteredCases.filter(c => c.status !== 'closed');
    const closedCases = filteredCases.filter(c => c.status === 'closed');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Case History & Conversations</h1>
                <p className="text-muted-foreground">
                    View your reported cases and communicate with healthcare professionals.
                </p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search cases by number, medicine, or symptom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('pending')}
                                size="sm"
                            >
                                Pending
                            </Button>
                            <Button
                                variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('reviewed')}
                                size="sm"
                            >
                                Reviewed
                            </Button>
                            <Button
                                variant={statusFilter === 'urgent' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('urgent')}
                                size="sm"
                            >
                                Urgent
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Cases */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="text-lg font-semibold mb-2">Loading your cases...</div>
                    <p className="text-muted-foreground">Please wait while we fetch your case history.</p>
                </div>
            ) : activeCases.length > 0 ? (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Active Cases ({activeCases.length})
                    </h3>
                    <div className="grid gap-4">
                        {activeCases.map((caseData) => (
                            <Card
                                key={caseData.id}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
                                    caseData.status === 'urgent' && "ring-2 ring-red-200 shadow-red-50",
                                    caseData.hasUnreadMessages && "ring-1 ring-blue-200"
                                )}
                                onClick={() => handleCaseClick(caseData)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-mono text-muted-foreground">
                                                {caseData.case_number}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", getStatusColor(caseData.status))}
                                            >
                                                {getStatusIcon(caseData.status)}
                                                <span className="ml-1 capitalize">{caseData.status}</span>
                                            </Badge>
                                            {caseData.hasUnreadMessages && (
                                                <Badge variant="default" className="text-xs bg-blue-600">
                                                    New Messages
                                                </Badge>
                                            )}
                                        </div>
                                        <div className={cn("text-sm font-medium", getRiskLevelColor(caseData.severity_score))}>
                                            Risk Level {getRiskLevel(caseData.severity_score)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-semibold text-base">{caseData.symptoms}</p>
                                            <p className="text-sm text-muted-foreground">Medicine: {caseData.medicine_name}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(caseData.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {caseData.messageCount || 0} messages
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Updated {caseData.last_update}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Closed Cases */}
            {closedCases.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Resolved Cases ({closedCases.length})
                    </h3>
                    <div className="grid gap-3">
                        {closedCases.map((caseData) => (
                            <Card
                                key={caseData.id}
                                className="cursor-pointer transition-all duration-200 hover:shadow-sm opacity-75 hover:opacity-100"
                                onClick={() => handleCaseClick(caseData)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-sm font-mono text-muted-foreground">
                                                    {caseData.case_number}
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(caseData.status)}>
                                                    {getStatusIcon(caseData.status)}
                                                    <span className="ml-1">Resolved</span>
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {caseData.messageCount || 0}
                                                </div>
                                            </div>
                                            <p className="font-medium text-sm">{caseData.symptoms}</p>
                                            <p className="text-xs text-muted-foreground">{caseData.medicine_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(caseData.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredCases.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        {searchTerm || statusFilter !== 'all' ? 'No matching cases found' : 'No cases yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'You haven\'t reported any side effects yet.'
                        }
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                        <Button>Report Your First Case</Button>
                    )}
                </div>
            )}

            {/* Case Detail Slide-Over */}
            <CaseDetailSlideOver
                isOpen={isSlideOverOpen}
                onClose={() => setIsSlideOverOpen(false)}
                caseData={selectedCase}
            />
        </div>
    );
};

export default HistoryPanelView;