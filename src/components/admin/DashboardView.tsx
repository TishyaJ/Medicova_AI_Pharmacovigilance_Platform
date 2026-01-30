import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, TrendingUp, UserCheck, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardView = () => {
    const trendData = [
        { name: 'Mon', incoming: 12, resolved: 10 },
        { name: 'Tue', incoming: 19, resolved: 15 },
        { name: 'Wed', incoming: 8, resolved: 12 },
        { name: 'Thu', incoming: 25, resolved: 20 },
        { name: 'Fri', incoming: 15, resolved: 12 },
        { name: 'Sat', incoming: 8, resolved: 8 },
        { name: 'Sun', incoming: 5, resolved: 4 },
    ];

    const liveFeed = [
        { id: 1, text: 'New Level 5 report from Maharashtra', time: '2 mins ago', type: 'critical' },
        { id: 2, text: 'Dr. Sharma resolved Case #402', time: '10 mins ago', type: 'success' },
        { id: 3, text: 'Stock alert: Paracetamol low in Delhi region', time: '15 mins ago', type: 'warning' },
        { id: 4, text: 'New doctor registration pending approval', time: '1 hour ago', type: 'info' },
        { id: 5, text: 'Patient PT-445 reported severe reaction', time: '2 hours ago', type: 'critical' },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-destructive">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">23</div>
                        <p className="text-xs text-muted-foreground mt-1">Level 5 cases requiring immediate action</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Load</CardTitle>
                        <Activity className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground mt-1">Active cases (Last 24h)</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
                        <UserCheck className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground mt-1">Cases stuck with doctors &gt; 24hrs</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">87/100</div>
                        <p className="text-xs text-muted-foreground mt-1">Overall system health index</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Incoming vs. Resolved Cases</CardTitle>
                        <CardDescription>Last 7 days - Monitor system capacity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip />
                                <Line type="monotone" dataKey="incoming" stroke="#ef4444" strokeWidth={2} name="Incoming" />
                                <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                        {trendData[trendData.length - 1].incoming > trendData[trendData.length - 1].resolved && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    Warning: Incoming reports exceeding resolution capacity
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Live Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Live Activity Feed
                        </CardTitle>
                        <CardDescription>Real-time system updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-3">
                                {liveFeed.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-3 rounded-lg border text-sm ${item.type === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200' :
                                                item.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-200' :
                                                    item.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' :
                                                        'bg-muted/50'
                                            }`}
                                    >
                                        <p className="font-medium">{item.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardView;
