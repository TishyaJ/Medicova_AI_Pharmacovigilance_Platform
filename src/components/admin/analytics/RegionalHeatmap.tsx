import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, AlertTriangle } from 'lucide-react';

// Mock data for states
const stateRiskData = {
    'Maharashtra': { cases: 450, critical: 12, riskScore: 85 },
    'Karnataka': { cases: 289, critical: 5, riskScore: 65 },
    'Delhi': { cases: 234, critical: 8, riskScore: 70 },
    'Tamil Nadu': { cases: 189, critical: 3, riskScore: 45 },
    'Gujarat': { cases: 156, critical: 2, riskScore: 35 },
    'Uttar Pradesh': { cases: 298, critical: 7, riskScore: 68 },
};

// Mock city cluster data for Maharashtra
const cityClusterData = [
    { name: 'Mumbai', risk: 'high', count: 145, critical: 5, pincode: '400001' },
    { name: 'Pune', risk: 'high', count: 189, critical: 7, pincode: '411001' },
    { name: 'Nagpur', risk: 'medium', count: 67, critical: 0, pincode: '440001' },
    { name: 'Nashik', risk: 'low', count: 49, critical: 0, pincode: '422001' },
    { name: 'Aurangabad', risk: 'medium', count: 78, critical: 2, pincode: '431001' },
    { name: 'Solapur', risk: 'low', count: 34, critical: 0, pincode: '413001' },
];

const RegionalHeatmap = () => {
    const [selectedState, setSelectedState] = useState<string | null>(null);

    const getStateColor = (riskScore: number) => {
        if (riskScore >= 70) return '#ef4444';
        if (riskScore >= 50) return '#f59e0b';
        return '#10b981';
    };

    const getMarkerColor = (risk: string) => {
        switch (risk) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {selectedState ? `${selectedState} - City Clusters` : 'India - National Heatmap'}
                    </h3>
                    <p className="text-muted-foreground">
                        {selectedState
                            ? 'Pincode-level analysis showing bad batch clusters'
                            : 'Click any state to drill down into city-level clusters'
                        }
                    </p>
                </div>
                {selectedState && (
                    <Button variant="outline" onClick={() => setSelectedState(null)} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to National View
                    </Button>
                )}
            </div>

            {/* Interactive Map */}
            <Card>
                <CardContent className="p-0">
                    <div className="relative h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">

                        {!selectedState ? (
                            // National View
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-full h-full max-w-4xl">

                                    {/* Maharashtra - High Risk */}
                                    <div className="absolute top-1/3 left-1/3 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setSelectedState('Maharashtra')}>
                                        <div className="h-20 w-20 bg-red-500/20 rounded-full animate-ping absolute" />
                                        <div className="h-16 w-16 bg-red-600 rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold shadow-lg">
                                            <div className="text-center">
                                                <div className="text-xs">MH</div>
                                                <div className="text-xs">{stateRiskData.Maharashtra.cases}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                            <p className="font-semibold text-red-600">Maharashtra</p>
                                            <p className="text-muted-foreground">{stateRiskData.Maharashtra.cases} cases • {stateRiskData.Maharashtra.critical} critical</p>
                                            <p className="text-xs text-primary mt-1">Click to drill down →</p>
                                        </div>
                                    </div>

                                    {/* Karnataka */}
                                    <div className="absolute bottom-1/3 left-1/2 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setSelectedState('Karnataka')}>
                                        <div className="h-14 w-14 bg-orange-500 rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold shadow-lg">
                                            <div className="text-center">
                                                <div className="text-xs">KA</div>
                                                <div className="text-xs">{stateRiskData.Karnataka.cases}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                            <p className="font-semibold text-orange-600">Karnataka</p>
                                            <p className="text-muted-foreground">{stateRiskData.Karnataka.cases} cases • {stateRiskData.Karnataka.critical} critical</p>
                                        </div>
                                    </div>

                                    {/* Delhi */}
                                    <div className="absolute top-1/4 left-1/2 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setSelectedState('Delhi')}>
                                        <div className="h-14 w-14 bg-orange-500 rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold shadow-lg">
                                            <div className="text-center">
                                                <div className="text-xs">DL</div>
                                                <div className="text-xs">{stateRiskData.Delhi.cases}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                            <p className="font-semibold text-orange-600">Delhi</p>
                                            <p className="text-muted-foreground">{stateRiskData.Delhi.cases} cases • {stateRiskData.Delhi.critical} critical</p>
                                        </div>
                                    </div>

                                    {/* Tamil Nadu */}
                                    <div className="absolute bottom-1/4 right-1/3 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setSelectedState('Tamil Nadu')}>
                                        <div className="h-12 w-12 bg-green-500 rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold shadow-lg">
                                            <div className="text-center">
                                                <div className="text-xs">TN</div>
                                                <div className="text-xs">{stateRiskData['Tamil Nadu'].cases}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                            <p className="font-semibold text-green-600">Tamil Nadu</p>
                                            <p className="text-muted-foreground">{stateRiskData['Tamil Nadu'].cases} cases • {stateRiskData['Tamil Nadu'].critical} critical</p>
                                        </div>
                                    </div>

                                    {/* Gujarat */}
                                    <div className="absolute top-1/3 left-1/4 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setSelectedState('Gujarat')}>
                                        <div className="h-12 w-12 bg-green-500 rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold shadow-lg">
                                            <div className="text-center">
                                                <div className="text-xs">GJ</div>
                                                <div className="text-xs">{stateRiskData.Gujarat.cases}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                            <p className="font-semibold text-green-600">Gujarat</p>
                                            <p className="text-muted-foreground">{stateRiskData.Gujarat.cases} cases • {stateRiskData.Gujarat.critical} critical</p>
                                        </div>
                                    </div>

                                    {/* Uttar Pradesh */}
                                    <div className="absolute top-1/4 right-1/3 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setSelectedState('Uttar Pradesh')}>
                                        <div className="h-14 w-14 bg-orange-500 rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold shadow-lg">
                                            <div className="text-center">
                                                <div className="text-xs">UP</div>
                                                <div className="text-xs">{stateRiskData['Uttar Pradesh'].cases}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                            <p className="font-semibold text-orange-600">Uttar Pradesh</p>
                                            <p className="text-muted-foreground">{stateRiskData['Uttar Pradesh'].cases} cases • {stateRiskData['Uttar Pradesh'].critical} critical</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // State Drill-Down View
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-full h-full max-w-4xl">
                                    {selectedState === 'Maharashtra' && cityClusterData.map((city, i) => (
                                        <div
                                            key={city.name}
                                            className="absolute group cursor-pointer"
                                            style={{
                                                top: `${25 + (i % 3) * 30}%`,
                                                left: `${20 + (i % 2) * 40 + Math.floor(i / 3) * 20}%`,
                                            }}
                                        >
                                            <div
                                                className={`rounded-full hover:scale-125 transition-all duration-300 relative flex items-center justify-center text-white font-bold text-sm shadow-lg ${city.critical > 0 ? 'h-16 w-16 bg-red-600' :
                                                        city.risk === 'medium' ? 'h-12 w-12 bg-orange-500' : 'h-10 w-10 bg-green-500'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-xs">{city.name.slice(0, 3)}</div>
                                                    <div className="text-xs">{city.count}</div>
                                                </div>
                                            </div>
                                            {city.critical > 0 && (
                                                <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                                            )}
                                            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-10 border">
                                                <p className="font-semibold">{city.name}</p>
                                                <p className="text-xs text-muted-foreground">Pincode: {city.pincode}</p>
                                                <p className="text-sm mt-1">{city.count} cases</p>
                                                {city.critical > 0 && (
                                                    <p className="text-sm text-red-600 font-medium">{city.critical} critical cases</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 p-4 rounded-lg shadow-lg text-sm space-y-3 min-w-[200px] border">
                            <p className="font-semibold mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {selectedState ? 'Cluster Types' : 'Risk Levels'}
                            </p>

                            {selectedState ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500" />
                                        <span>High Risk (&gt;5 critical)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-orange-500" />
                                        <span>Medium Risk (1-5 critical)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-green-500" />
                                        <span>Low Risk (0 critical)</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500" />
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
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Table */}
            <Card>
                <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">
                        {selectedState ? 'City-wise Breakdown' : 'State-wise Risk Analysis'}
                    </h4>
                    <div className="space-y-2">
                        {selectedState ? (
                            cityClusterData.map((city) => (
                                <div key={city.name} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getMarkerColor(city.risk) }}
                                            />
                                            <div>
                                                <p className="font-semibold">{city.name}</p>
                                                <p className="text-sm text-muted-foreground">Pincode: {city.pincode}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{city.count}</p>
                                            <p className="text-xs text-muted-foreground">total cases</p>
                                            {city.critical > 0 && (
                                                <Badge variant="destructive" className="mt-1">
                                                    {city.critical} Critical
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            Object.entries(stateRiskData).map(([stateName, data]) => (
                                <div
                                    key={stateName}
                                    onClick={() => setSelectedState(stateName)}
                                    className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getStateColor(data.riskScore) }}
                                            />
                                            <div>
                                                <p className="font-semibold">{stateName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Risk Score: {data.riskScore}/100
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-lg font-bold">{data.cases}</p>
                                                <p className="text-xs text-muted-foreground">cases</p>
                                            </div>
                                            <Badge variant="destructive">{data.critical} Critical</Badge>
                                            <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                Drill Down →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegionalHeatmap;