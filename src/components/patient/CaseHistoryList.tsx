import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseData {
    id: string;
    caseNumber: string;
    date: string;
    medicine: string;
    symptom: string;
    status: 'pending' | 'reviewed' | 'closed' | 'urgent';
    riskLevel: 1 | 2 | 3 | 4 | 5;
    doctorVerdict?: string;
    lastUpdate: string;
}

interface CaseHistoryListProps {
    onCaseClick: (caseData: CaseData) => void;
}

// Mock case data
const mockCases: CaseData[] = [
    {
        id: '1',
        caseNumber: 'MC-2025-001',
        date: '2025-01-28',
        medicine: 'Dolo-650',
        symptom: 'Skin Rash',
        status: 'pending',
        riskLevel: 3,
        lastUpdate: '2 hours ago'
    },
    {
        id: '2',
        caseNumber: 'MC-2025-002',
        date: '2025-01-25',
        medicine: 'Augmentin-625',
        symptom: 'Nausea & Vomiting',
        status: 'reviewed',
        riskLevel: 2,
        doctorVerdict: 'Common side effect. Reduce dosage and take with food.',
        lastUpdate: '3 days ago'
    },
    {
        id: '3',
        caseNumber: 'MC-2025-003',
        date: '2025-01-20',
        medicine: 'Paracetamol',
        symptom: 'Mild Headache',
        status: 'closed',
        riskLevel: 1,
        doctorVerdict: 'No adverse reaction. Symptom unrelated to medication.',
        lastUpdate: '1 week ago'
    },
    {
        id: '4',
        caseNumber: 'MC-2025-004',
        date: '2025-01-30',
        medicine: 'Remsima',
        symptom: 'Breathing Difficulty',
        status: 'urgent',
        riskLevel: 5,
        lastUpdate: '30 minutes ago'
    }
];

const CaseHistoryList = ({ onCaseClick }: CaseHistoryListProps) => {
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

    const getRiskLevelColor = (level: number) => {
        if (level >= 4) return 'text-red-600';
        if (level >= 3) return 'text-orange-600';
        if (level >= 2) return 'text-yellow-600';
        return 'text-green-600';
    };

    const activeCases = mockCases.filter(c => c.status !== 'closed');
    const closedCases = mockCases.filter(c => c.status === 'closed');

    return (
        <div className="space-y-6">
            {/* Active Cases */}
            {activeCases.length > 0 && (
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
                                    "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                                    caseData.status === 'urgent' && "ring-2 ring-red-200 shadow-red-50"
                                )}
                                onClick={() => onCaseClick(caseData)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-mono text-muted-foreground">
                                                {caseData.caseNumber}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", getStatusColor(caseData.status))}
                                            >
                                                {getStatusIcon(caseData.status)}
                                                <span className="ml-1 capitalize">{caseData.status}</span>
                                            </Badge>
                                        </div>
                                        <div className={cn("text-sm font-medium", getRiskLevelColor(caseData.riskLevel))}>
                                            Risk Level {caseData.riskLevel}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-semibold text-base">{caseData.symptom}</p>
                                            <p className="text-sm text-muted-foreground">Medicine: {caseData.medicine}</p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(caseData.date).toLocaleDateString()}
                                            </div>
                                            <div>Updated {caseData.lastUpdate}</div>
                                        </div>

                                        {caseData.doctorVerdict && (
                                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    <strong>Doctor's Note:</strong> {caseData.doctorVerdict}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Closed Cases */}
            {closedCases.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Case History ({closedCases.length})
                    </h3>
                    <div className="grid gap-3">
                        {closedCases.map((caseData) => (
                            <Card
                                key={caseData.id}
                                className="cursor-pointer transition-all duration-200 hover:shadow-sm opacity-75 hover:opacity-100"
                                onClick={() => onCaseClick(caseData)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-sm font-mono text-muted-foreground">
                                                    {caseData.caseNumber}
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(caseData.status)}>
                                                    {getStatusIcon(caseData.status)}
                                                    <span className="ml-1">Resolved</span>
                                                </Badge>
                                            </div>
                                            <p className="font-medium text-sm">{caseData.symptom}</p>
                                            <p className="text-xs text-muted-foreground">{caseData.medicine}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(caseData.date).toLocaleDateString()}
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
            {mockCases.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Cases Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        You haven't reported any side effects yet.
                    </p>
                    <Button>Report Your First Case</Button>
                </div>
            )}
        </div>
    );
};

export default CaseHistoryList;