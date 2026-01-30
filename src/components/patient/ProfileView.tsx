import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User,
    MapPin,
    Calendar,
    Activity,
    Shield,
    Edit,
    Phone,
    Mail,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProfileView = () => {
    const { user } = useAuth();

    // Mock profile data (would come from user context/API)
    const profileData = {
        personalInfo: {
            name: user?.name || 'John Patient',
            patientId: user?.id || 'P001',
            age: '32 years',
            gender: 'Male',
            phone: '+91 98765 43210',
            email: 'john.patient@email.com',
            pinCode: '400001',
            location: 'Mumbai, Maharashtra'
        },
        medicalInfo: {
            bloodGroup: 'O+',
            height: '175 cm',
            weight: '70 kg',
            abhaId: 'ABHA-1234567890',
            allergies: ['Penicillin', 'Shellfish'],
            conditions: ['Hypertension'],
            currentMedicines: ['Amlodipine 5mg'],
            emergencyContact: {
                name: 'Jane Patient',
                relation: 'Spouse',
                phone: '+91 98765 43211'
            }
        },
        accountInfo: {
            joinDate: '2024-12-15',
            lastLogin: '2025-01-30',
            verificationStatus: 'verified',
            profileCompletion: 95
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your personal and medical information.
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </Button>
            </div>

            {/* Profile Completion */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Profile Completion</h3>
                            <p className="text-sm text-muted-foreground">
                                Complete your profile for better healthcare services
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                                {profileData.accountInfo.profileCompletion}%
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Almost Complete
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="font-semibold">{profileData.personalInfo.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                    {profileData.personalInfo.patientId}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Age</label>
                                <p className="font-semibold">{profileData.personalInfo.age}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                                <p className="font-semibold">{profileData.personalInfo.gender}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">{profileData.personalInfo.phone}</p>
                                    <p className="text-xs text-muted-foreground">Primary contact</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">{profileData.personalInfo.email}</p>
                                    <p className="text-xs text-muted-foreground">Email address</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">{profileData.personalInfo.location}</p>
                                    <p className="text-xs text-muted-foreground">PIN: {profileData.personalInfo.pinCode}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Medical Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                                <p className="font-semibold">{profileData.medicalInfo.bloodGroup}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">ABHA ID</label>
                                <p className="font-mono text-sm">{profileData.medicalInfo.abhaId}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Height</label>
                                <p className="font-semibold">{profileData.medicalInfo.height}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Weight</label>
                                <p className="font-semibold">{profileData.medicalInfo.weight}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Known Allergies</label>
                                <div className="flex gap-2 mt-1">
                                    {profileData.medicalInfo.allergies.map((allergy) => (
                                        <Badge key={allergy} variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {allergy}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Medical Conditions</label>
                                <div className="flex gap-2 mt-1">
                                    {profileData.medicalInfo.conditions.map((condition) => (
                                        <Badge key={condition} variant="outline" className="text-xs">
                                            {condition}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Current Medicines</label>
                                <div className="flex gap-2 mt-1">
                                    {profileData.medicalInfo.currentMedicines.map((medicine) => (
                                        <Badge key={medicine} variant="secondary" className="text-xs">
                                            {medicine}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="font-semibold">{profileData.medicalInfo.emergencyContact.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Relation</label>
                                <p className="font-semibold">{profileData.medicalInfo.emergencyContact.relation}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <p className="font-semibold">{profileData.medicalInfo.emergencyContact.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                                <p className="font-semibold">
                                    {new Date(profileData.accountInfo.joinDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                                <p className="font-semibold">
                                    {new Date(profileData.accountInfo.lastLogin).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Privacy & Security */}
            <Card>
                <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Change Password
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Privacy Settings
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <Activity className="h-4 w-4 mr-2" />
                            Data Export
                        </Button>
                        <Button variant="outline" className="justify-start text-red-600 hover:text-red-700">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileView;