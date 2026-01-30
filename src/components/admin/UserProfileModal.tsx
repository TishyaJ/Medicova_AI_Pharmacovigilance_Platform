import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MapPin, Award, Activity, TrendingUp, Package } from 'lucide-react';

interface UserProfileModalProps {
    user: any;
    open: boolean;
    onClose: () => void;
}

const UserProfileModal = ({ user, open, onClose }: UserProfileModalProps) => {
    if (!user) return null;

    const renderDoctorProfile = () => (
        <>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">License ID</p>
                    <p className="font-semibold">{user.licenseId || 'MD-12345'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Specialization</p>
                    <p className="font-semibold">{user.specialization || 'General Medicine'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Hospital</p>
                    <p className="font-semibold">{user.hospital || 'City Hospital'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.region}
                    </p>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cases Assigned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">156</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cases Reviewed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">142</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            4.2h
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Reviews
                </h4>
                <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-3 rounded-lg bg-muted/50 border text-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium">Case #{1000 + i}</span>
                                    <Badge variant="outline" className="text-xs">Resolved</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">Patient reported mild headache after medication</p>
                                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </>
    );

    const renderPharmacistProfile = () => (
        <>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Shop Name</p>
                    <p className="font-semibold">{user.shopName || 'Apollo Pharmacy'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">License</p>
                    <p className="font-semibold">{user.licenseId || 'PH-9876'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.region}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-green-100 text-green-700">{user.status}</Badge>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Stock Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold flex items-center gap-1">
                            <Package className="h-5 w-5" />
                            23
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Adverse Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">8</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Stock Demands
                </h4>
                <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                        {['Paracetamol 500mg', 'Amoxicillin 250mg', 'Cetirizine 10mg'].map((med, i) => (
                            <div key={i} className="p-3 rounded-lg bg-muted/50 border text-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium">{med}</span>
                                    <Badge variant="outline" className="text-xs">Pending</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">Requested: 500 units</p>
                                <p className="text-xs text-muted-foreground mt-1">{i + 1} day ago</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </>
    );

    const renderPatientProfile = () => (
        <>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold">{user.age || '32'} years</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold">{user.gender || 'Male'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.region}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <Badge variant={user.status === 'Flagged' ? 'destructive' : 'outline'}>
                        {user.status === 'Flagged' ? 'High Risk' : 'Normal'}
                    </Badge>
                </div>
            </div>

            <Separator className="my-4" />

            <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Medical Timeline
                </h4>
                <ScrollArea className="h-[250px]">
                    <div className="relative pl-6 space-y-4">
                        {/* Timeline line */}
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

                        {[
                            { date: 'Jan 12, 2025', event: 'Reported breathing difficulty', severity: 'high' },
                            { date: 'Jan 10, 2025', event: 'Reported mild rash', severity: 'medium' },
                            { date: 'Jan 5, 2025', event: 'Started new medication', severity: 'low' },
                            { date: 'Dec 28, 2024', event: 'Initial consultation', severity: 'low' },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 border-background ${item.severity === 'high' ? 'bg-red-500' :
                                        item.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} />
                                <div className="p-3 rounded-lg bg-muted/50 border">
                                    <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
                                    <p className="text-sm font-medium">{item.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </>
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <DialogTitle className="text-2xl">{user.name}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{user.role}</Badge>
                                <span className="text-xs">ID: {user.id}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                        {user.role === 'Doctor' && renderDoctorProfile()}
                        {user.role === 'Pharmacist' && renderPharmacistProfile()}
                        {user.role === 'Patient' && renderPatientProfile()}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default UserProfileModal;
