import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, PieChart as PieChartIcon, Activity, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { medicinesData } from './medicineData';

const MedicineRiskAnalysis = () => {
    const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
    const [medicineSearch, setMedicineSearch] = useState('');

    const filteredMedicines = medicinesData.filter(med =>
        med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        med.manufacturer.toLowerCase().includes(medicineSearch.toLowerCase())
    );

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Left Sidebar - Medicine List */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="text-base">Medicine Database</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search medicines..."
                            value={medicineSearch}
                            onChange={(e) => setMedicineSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-1 p-4">
                            {filteredMedicines.map((med) => (
                                <div
                                    key={med.id}
                                    onClick={() => setSelectedMedicine(med)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedMedicine?.id === med.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'hover:bg-muted/50 border-transparent'
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{med.name}</p>
                                    <p className="text-xs opacity-80">{med.manufacturer}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {med.adverseEvents} AE
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Right Panel - Medicine Analysis */}
            <div className="md:col-span-2 space-y-4">
                {selectedMedicine ? (
                    <>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">{selectedMedicine.name}</CardTitle>
                                        <CardDescription>{selectedMedicine.manufacturer}</CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            selectedMedicine.sentiment === 'High Alert' ? 'destructive' :
                                                selectedMedicine.sentiment === 'Moderate Concern' ? 'default' :
                                                    'outline'
                                        }
                                    >
                                        {selectedMedicine.sentiment}
                                    </Badge>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* AI Summary Cards */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Overall Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {selectedMedicine.summary}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <PieChartIcon className="h-4 w-4" />
                                        Sentiment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-2xl font-bold ${selectedMedicine.sentiment === 'High Alert' ? 'text-red-600' :
                                            selectedMedicine.sentiment === 'Moderate Concern' ? 'text-orange-600' :
                                                'text-green-600'
                                        }`}>
                                        {selectedMedicine.sentiment}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on {selectedMedicine.adverseEvents} reports
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        AI Action
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {selectedMedicine.aiAction}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Safety Profile</CardTitle>
                                    <CardDescription>Risk level distribution</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={selectedMedicine.riskDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                label={({ level, value }) => `${level}: ${value}%`}
                                            >
                                                {selectedMedicine.riskDistribution.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Batch vs. Safety</CardTitle>
                                    <CardDescription>Sales volume vs adverse events</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={selectedMedicine.batchData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="batch" className="text-xs" />
                                            <YAxis className="text-xs" />
                                            <Tooltip />
                                            <Bar dataKey="sales" fill="#3b82f6" name="Units Sold" />
                                            <Bar dataKey="events" fill="#ef4444" name="Adverse Events" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Symptom Word Cloud */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Common Symptoms</CardTitle>
                                <CardDescription>Most reported symptoms with this medicine</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMedicine.symptoms.map((symptom: string, i: number) => (
                                        <Badge
                                            key={symptom}
                                            variant="outline"
                                            className="text-sm py-2 px-4"
                                            style={{
                                                fontSize: `${14 + (selectedMedicine.symptoms.length - i) * 2}px`,
                                            }}
                                        >
                                            {symptom}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="h-[600px] flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <PieChartIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a medicine to view analysis</p>
                            <p className="text-sm mt-2">Click any medicine from the list to see detailed insights</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MedicineRiskAnalysis;
