import { useState, useEffect } from 'react';
import { mockPatientCases } from '@/data/mockData';
import { PatientCase } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, AlertTriangle, CheckCircle2, MessageSquare, ArrowUpRight, Activity, XCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Fetch Cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Passing hardcoded role/id for now as current AuthContext is mock
        const response = await api.get('/cases/', {
          params: { role: 'doctor', user_id: 2 }
        });

        // Map Backend Data to Frontend Type
        const mappedCases: PatientCase[] = response.data.map((c: any) => ({
          id: c.id.toString(),
          patientName: `Patient #${c.user_id || '?'}`, // We need to fetch names later
          medicineName: c.medicine_name,
          allergies: [], // Backend missing this
          source: c.source,
          status: c.status,
          query: c.symptoms,
          timestamp: new Date(c.created_at),
          riskLevel: c.severity_label === 'strong' ? 'high' : c.severity_label === 'unexpected' ? 'medium' : 'low',
          region: 'Unknown',
          isPregnant: false
        }));
        setCases(mappedCases);
      } catch (error) {
        console.error("Failed to fetch cases", error);
        // Fallback to mock if API fails (e.g. server not running)
        setCases(mockPatientCases);
      }
    };
    fetchCases();
  }, []);

  // Derived State
  const escalatedCases = cases.filter(c => c.riskLevel === 'high' && c.status === 'pending');
  const pendingCases = cases.filter(c => c.riskLevel !== 'high' && c.status === 'pending');
  const otherCases = cases.filter(c => c.status !== 'pending');

  const handleUpdateStatus = (id: string, status: PatientCase['status']) => {
    setCases(cases.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Case marked as ${status}`);
    setSelectedCase(null);
    setReviewNote('');
  };

  const CaseCard = ({ caseItem }: { caseItem: PatientCase }) => (
    <div
      onClick={() => setSelectedCase(caseItem)}
      className={cn(
        'cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md bg-card/50',
        caseItem.riskLevel === 'high' ? 'border-destructive/30 bg-destructive/5' : 'border-border/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-background">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caseItem.patientName}`} />
            <AvatarFallback>{caseItem.patientName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold leading-none">{caseItem.patientName}</h3>
            <p className="text-xs text-muted-foreground mt-1">{caseItem.region || 'Unknown Region'}</p>
          </div>
        </div>
        {caseItem.riskLevel === 'high' && (
          <Badge variant="destructive" className="animate-pulse">Critical</Badge>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="bg-muted/50 p-2 rounded text-sm text-muted-foreground line-clamp-2">
          "{caseItem.query}"
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className={cn(caseItem.source === 'whatsapp' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200')}>
            {caseItem.source === 'whatsapp' ? 'WhatsApp' : 'Web'}
          </Badge>
          <Badge variant="secondary">{caseItem.medicineName}</Badge>
          {caseItem.isPregnant && <Badge variant="outline" className="border-warning text-warning">Pregnant</Badge>}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground text-right border-t pt-2">
        ID: {caseItem.id} • {new Date(caseItem.timestamp).toLocaleDateString()}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage consultations and review patient alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            Waitlist: {pendingCases.length + escalatedCases.length}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Main Content - Queue */}
        <div className="md:col-span-3 space-y-6">
          <Tabs defaultValue="escalated" className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b rounded-none mb-6">
              <TabsTrigger value="escalated" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive rounded-none py-2 gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Critical <Badge variant="destructive" className="ml-1 h-5 px-1.5">{escalatedCases.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 gap-2">
                <ClipboardList className="h-4 w-4" />
                Pending <Badge variant="secondary" className="ml-1 h-5 px-1.5">{pendingCases.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-500 rounded-none py-2 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="escalated" className="animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {escalatedCases.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed text-sm">
                    No critical cases pending.
                  </div>
                ) : escalatedCases.map(c => <CaseCard key={c.id} caseItem={c} />)}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCases.map(c => <CaseCard key={c.id} caseItem={c} />)}
              </div>
            </TabsContent>

            <TabsContent value="history" className="animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {otherCases.map(c => <CaseCard key={c.id} caseItem={c} />)}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3">Quick Search</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Patient Name or ID" className="pl-9" />
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10">
            <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Today's Schedule</h3>
            <p className="text-sm text-muted-foreground">You have no scheduled appointments.</p>
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedCase && (
            <div className="space-y-6 pt-6">
              <SheetHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={selectedCase.riskLevel === 'high' ? 'destructive' : 'outline'}>
                    {selectedCase.riskLevel === 'high' ? 'CRITICAL RISK' : 'Routine Case'}
                  </Badge>
                  <Badge variant="outline">{selectedCase.source?.toUpperCase() || 'WEB'}</Badge>
                </div>
                <SheetTitle className="text-2xl">{selectedCase.patientName}</SheetTitle>
                <SheetDescription>
                  Patient ID: {selectedCase.id} • {selectedCase.region}
                </SheetDescription>
              </SheetHeader>

              {/* AI Summary Mock */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <Activity className="h-4 w-4" /> AI Analysis
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Patient reported symptoms matching typical side effects of <strong>{selectedCase.medicineName}</strong>.
                  Sentiment analysis indicates {selectedCase.riskLevel === 'high' ? 'high distress' : 'moderate concern'}.
                  Recommended checking for drug-drug interactions if on multiple meds.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <label className="text-xs text-muted-foreground font-medium uppercase">Medicine</label>
                    <p className="font-medium">{selectedCase.medicineName}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <label className="text-xs text-muted-foreground font-medium uppercase">Allergies</label>
                    <p className="font-medium text-destructive">{selectedCase.allergies.join(', ') || 'None'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Patient Query</label>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm">
                    "{selectedCase.query}"
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Clinical Notes</label>
                  <Textarea
                    placeholder="Enter your assessment notes here..."
                    className="min-h-[120px]"
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="default"
                    onClick={() => handleUpdateStatus(selectedCase.id, 'reviewed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve Case
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus(selectedCase.id, 'escalated')}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Escalate
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setSelectedCase(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DoctorDashboard;
