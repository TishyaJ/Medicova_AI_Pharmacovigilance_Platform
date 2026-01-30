import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const RegionalIntelligence = () => {
    const [selectedState, setSelectedState] = useState<string | null>(null);

    const statesData = [
        { name: 'Maharashtra', cases: 450, critical: 12, severity: 'high', color: '#ef4444' },
        { name: 'Karnataka', cases: 289, critical: 5, severity: 'medium', color: '#f59e0b' },
        { name: 'Delhi', cases: 234, critical: 8, severity: 'medium', color: '#f59e0b' },
        { name: 'Tamil Nadu', cases: 189, critical: 3, severity: 'low', color: '#10b981' },
        { name: 'Gujarat', cases: 156, critical: 2, severity: 'low', color: '#10b981' },
    ];

    const maharashtraClusters = [
        { city: 'Mumbai', pincode: '400001', cases: 145, critical: 5 },
        { city: 'Pune', pincode: '411001', cases: 189, critical: 7 },
        { city: 'Nagpur', pincode: '440001', cases: 67, critical: 0 },
        { city: 'Nashik', pincode: '422001', cases: 49, critical: 0 },
    ];

    return (
        <div className="space-y-6">
            {!selectedState ? (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                India - National Heatmap
                            </CardTitle>
                            <CardDescription>Click any state to drill down into city-level clusters</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[500px] bg-slate-50 dark:bg-slate-900 rounded-lg relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <MapPin className="h-60 w-60 text-primary" />
                            </div>

                            {/* Maharashtra */}
                            <div className="absolute top-1/4 left-1/4 group cursor-pointer" onClick={() => setSelectedState('Maharashtra')}>
                                <div className="h-16 w-16 bg-red-500/30 rounded-full animate-ping absolute" />
                                <div className="h-12 w-12 bg-red-600 rounded-full hover:scale-125 transition-transform relative flex items-center justify-center text-white font-bold text-xs">
                                    MH
                                </div>
                                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10">
                                    <p className="font-semibold text-red-600">Maharashtra</p>
                                    <p className="text-muted-foreground">450 cases • 12 critical</p>
                                    <p className="text-xs text-primary mt-1">Click to drill down</p>
                                </div>
                            </div>

                            {/* Karnataka */}
                            <div className="absolute top-1/3 right-1/3 group cursor-pointer">
                                <div className="h-12 w-12 bg-orange-500/30 rounded-full animate-pulse absolute" />
                                <div className="h-10 w-10 bg-orange-500 rounded-full hover:scale-125 transition-transform relative flex items-center justify-center text-white font-bold text-xs">
                                    KA
                                </div>
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10">
                                    <p className="font-semibold text-orange-600">Karnataka</p>
                                    <p className="text-muted-foreground">289 cases • 5 critical</p>
                                </div>
                            </div>

                            {/* Delhi */}
                            <div className="absolute top-1/5 left-1/2 group cursor-pointer">
                                <div className="h-12 w-12 bg-orange-500/30 rounded-full animate-pulse absolute" />
                                <div className="h-10 w-10 bg-orange-500 rounded-full hover:scale-125 transition-transform relative flex items-center justify-center text-white font-bold text-xs">
                                    DL
                                </div>
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10">
                                    <p className="font-semibold text-orange-600">Delhi</p>
                                    <p className="text-muted-foreground">234 cases • 8 critical</p>
                                </div>
                            </div>

                            {/* Tamil Nadu */}
                            <div className="absolute bottom-1/3 right-1/4 group cursor-pointer">
                                <div className="h-8 w-8 bg-green-500 rounded-full hover:scale-125 transition-transform relative flex items-center justify-center text-white font-bold text-xs">
                                    TN
                                </div>
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10">
                                    <p className="font-semibold text-green-600">Tamil Nadu</p>
                                    <p className="text-muted-foreground">189 cases • 3 critical</p>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 p-4 rounded-lg shadow-md text-sm space-y-2">
                                <p className="font-semibold mb-2">Severity Levels</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-600" />
                                    <span>High (&gt;400 cases)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                                    <span>Medium (200-400 cases)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500" />
                                    <span>Low (&lt;200 cases)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>State-wise Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {statesData.map((state) => (
                                    <div
                                        key={state.name}
                                        onClick={() => setSelectedState(state.name)}
                                        className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }} />
                                            <div>
                                                <p className="font-semibold">{state.name}</p>
                                                <p className="text-sm text-muted-foreground">{state.cases} total cases</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="destructive">{state.critical} Critical</Badge>
                                            <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedState(null)}>
                            ← Back to National View
                        </Button>
                        <h3 className="text-xl font-bold">{selectedState} - City Clusters</h3>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pincode-Level Analysis</CardTitle>
                            <CardDescription>Identify bad batch clusters by location</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[400px] bg-slate-50 dark:bg-slate-900 rounded-lg relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <MapPin className="h-40 w-40 text-primary" />
                            </div>

                            {maharashtraClusters.map((cluster, i) => (
                                <div
                                    key={cluster.city}
                                    className="absolute group cursor-pointer"
                                    style={{
                                        top: `${20 + i * 20}%`,
                                        left: `${25 + i * 15}%`,
                                    }}
                                >
                                    <div
                                        className={`rounded-full hover:scale-125 transition-transform relative flex items-center justify-center text-white font-bold text-xs ${cluster.critical > 0 ? 'h-12 w-12 bg-red-600' : 'h-8 w-8 bg-green-500'
                                            }`}
                                    >
                                        {cluster.cases}
                                    </div>
                                    <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10">
                                        <p className="font-semibold">{cluster.city}</p>
                                        <p className="text-xs text-muted-foreground">Pincode: {cluster.pincode}</p>
                                        <p className="text-sm mt-1">{cluster.cases} cases</p>
                                        {cluster.critical > 0 && (
                                            <p className="text-sm text-red-600">{cluster.critical} critical</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>City-wise Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {maharashtraClusters.map((cluster) => (
                                    <div key={cluster.city} className="p-4 rounded-lg border">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{cluster.city}</p>
                                                <p className="text-sm text-muted-foreground">Pincode: {cluster.pincode}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{cluster.cases}</p>
                                                <p className="text-xs text-muted-foreground">total cases</p>
                                                {cluster.critical > 0 && (
                                                    <Badge variant="destructive" className="mt-1">{cluster.critical} Critical</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default RegionalIntelligence;
