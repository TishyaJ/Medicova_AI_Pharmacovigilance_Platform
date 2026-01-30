import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Stethoscope, Pill, UserCheck, ChevronRight } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

const UsersView = () => {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('doctors');

    const users = {
        doctors: [
            { id: 'DR001', name: 'Dr. Sarah Smith', role: 'Doctor', region: 'Mumbai', status: 'Active', specialization: 'Cardiology', hospital: 'Apollo Hospital' },
            { id: 'DR002', name: 'Dr. John Doe', role: 'Doctor', region: 'Delhi', status: 'Active', specialization: 'General Medicine', hospital: 'Max Hospital' },
            { id: 'DR003', name: 'Dr. Priya Sharma', role: 'Doctor', region: 'Bangalore', status: 'Pending Review', specialization: 'Pediatrics', hospital: 'Fortis Hospital' },
            { id: 'DR004', name: 'Dr. Rajesh Kumar', role: 'Doctor', region: 'Chennai', status: 'Active', specialization: 'Orthopedics', hospital: 'AIIMS' },
            { id: 'DR005', name: 'Dr. Anita Desai', role: 'Doctor', region: 'Pune', status: 'Active', specialization: 'Dermatology', hospital: 'Ruby Hall' },
        ],
        pharmacists: [
            { id: 'PH001', name: 'Apollo Pharmacy', role: 'Pharmacist', region: 'Mumbai', status: 'Active', shopName: 'Apollo Pharmacy', licenseId: 'PH-1001' },
            { id: 'PH002', name: 'MedPlus Store', role: 'Pharmacist', region: 'Chennai', status: 'Active', shopName: 'MedPlus', licenseId: 'PH-1002' },
            { id: 'PH003', name: 'Wellness Forever', role: 'Pharmacist', region: 'Delhi', status: 'Active', shopName: 'Wellness Forever', licenseId: 'PH-1003' },
            { id: 'PH004', name: 'Netmeds Pharmacy', role: 'Pharmacist', region: 'Bangalore', status: 'Pending Review', shopName: 'Netmeds', licenseId: 'PH-1004' },
        ],
        patients: [
            { id: 'PT001', name: 'Raj Kumar', role: 'Patient', region: 'Bangalore', status: 'Flagged', age: 45, gender: 'Male' },
            { id: 'PT002', name: 'Anita Desai', role: 'Patient', region: 'Pune', status: 'Active', age: 32, gender: 'Female' },
            { id: 'PT003', name: 'Vikram Singh', role: 'Patient', region: 'Delhi', status: 'Active', age: 28, gender: 'Male' },
            { id: 'PT004', name: 'Priya Nair', role: 'Patient', region: 'Mumbai', status: 'Active', age: 35, gender: 'Female' },
            { id: 'PT005', name: 'Amit Patel', role: 'Patient', region: 'Ahmedabad', status: 'Flagged', age: 52, gender: 'Male' },
            { id: 'PT006', name: 'Sneha Reddy', role: 'Patient', region: 'Hyderabad', status: 'Active', age: 29, gender: 'Female' },
        ],
    };

    const filteredUsers = (userList: any[]) => {
        if (!searchTerm) return userList;
        return userList.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.region.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">CRM-style interface for all stakeholders</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users by name, ID, or region..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="doctors" className="gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Doctors
                    </TabsTrigger>
                    <TabsTrigger value="pharmacists" className="gap-2">
                        <Pill className="h-4 w-4" />
                        Pharmacists
                    </TabsTrigger>
                    <TabsTrigger value="patients" className="gap-2">
                        <UserCheck className="h-4 w-4" />
                        Patients
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="doctors" className="mt-6">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers(users.doctors).map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-background">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">{user.specialization}</p>
                                    <p className="text-muted-foreground">{user.hospital}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-muted-foreground">{user.region}</span>
                                        <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pharmacists" className="mt-6">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers(users.pharmacists).map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-background">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">{user.shopName}</p>
                                    <p className="text-xs text-muted-foreground">License: {user.licenseId}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-muted-foreground">{user.region}</span>
                                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="patients" className="mt-6">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers(users.patients).map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-background">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">{user.age} years • {user.gender}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-muted-foreground">{user.region}</span>
                                        <Badge variant={user.status === 'Flagged' ? 'destructive' : 'outline'} className="text-xs">
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* User Profile Modal */}
            <UserProfileModal
                user={selectedUser}
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    );
};

export default UsersView;
