import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User,
    MapPin,
    Calendar,
    Activity,
    Shield,
    Edit,
    Save,
    X,
    Phone,
    Mail,
    AlertTriangle,
    Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

const ProfileView = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);
    const [editedData, setEditedData] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, [user?.id]);

    const loadProfile = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            // Fetch user profile from backend
            // For now, initialize with user data from auth context
            const initialData = {
                personalInfo: {
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone_number || '',
                    age: user?.profile_data?.age || '',
                    gender: user?.profile_data?.gender || '',
                    pinCode: user?.profile_data?.pin_code || '',
                    location: user?.profile_data?.location || ''
                },
                medicalInfo: {
                    bloodGroup: user?.profile_data?.blood_group || '',
                    height: user?.profile_data?.height || '',
                    weight: user?.profile_data?.weight || '',
                    abhaId: user?.profile_data?.abha_id || '',
                    allergies: user?.profile_data?.allergies || [],
                    medicalConditions: user?.profile_data?.medical_conditions || [],
                    currentMedicines: user?.profile_data?.current_medicines || []
                },
                emergencyContact: {
                    name: user?.profile_data?.emergency_contact_name || '',
                    relation: user?.profile_data?.emergency_contact_relation || '',
                    phone: user?.profile_data?.emergency_contact_phone || ''
                }
            };

            setProfileData(initialData);
            setEditedData(initialData);
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = (data: any) => {
        if (!data) return 0;

        const fields = [
            data.personalInfo.name,
            data.personalInfo.email,
            data.personalInfo.phone,
            data.personalInfo.age,
            data.personalInfo.gender,
            data.personalInfo.pinCode,
            data.medicalInfo.bloodGroup,
            data.medicalInfo.height,
            data.medicalInfo.weight,
            data.emergencyContact.name,
            data.emergencyContact.phone
        ];

        const filledFields = fields.filter(f => f && f.toString().trim() !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const handleSave = async () => {
        if (!user?.id) return;

        try {
            const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

            // Prepare profile data for backend
            const profileUpdate = {
                age: editedData.personalInfo.age,
                gender: editedData.personalInfo.gender,
                pin_code: editedData.personalInfo.pinCode,
                location: editedData.personalInfo.location,
                blood_group: editedData.medicalInfo.bloodGroup,
                height: editedData.medicalInfo.height,
                weight: editedData.medicalInfo.weight,
                abha_id: editedData.medicalInfo.abhaId,
                allergies: editedData.medicalInfo.allergies,
                medical_conditions: editedData.medicalInfo.medicalConditions,
                current_medicines: editedData.medicalInfo.currentMedicines,
                emergency_contact_name: editedData.emergencyContact.name,
                emergency_contact_relation: editedData.emergencyContact.relation,
                emergency_contact_phone: editedData.emergencyContact.phone
            };

            await authAPI.updateProfile(userId, profileUpdate);
            setProfileData(editedData);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setEditedData(profileData);
        setIsEditing(false);
    };

    const updateField = (section: string, field: string, value: any) => {
        setEditedData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const addArrayItem = (section: string, field: string, value: string) => {
        if (!value.trim()) return;
        setEditedData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: [...(prev[section][field] || []), value]
            }
        }));
    };

    const removeArrayItem = (section: string, field: string, index: number) => {
        setEditedData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: prev[section][field].filter((_: any, i: number) => i !== index)
            }
        }));
    };

    if (loading || !profileData) {
        return <div className="text-center py-12">Loading profile...</div>;
    }

    const completion = calculateCompletion(isEditing ? editedData : profileData);
    const data = isEditing ? editedData : profileData;

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
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                )}
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
                                {completion}%
                            </div>
                            <Badge variant="outline" className={completion >= 80 ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}>
                                {completion >= 80 ? 'Almost Complete' : 'Incomplete'}
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
                                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                {isEditing ? (
                                    <Input
                                        value={data.personalInfo.name}
                                        onChange={(e) => updateField('personalInfo', 'name', e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                ) : (
                                    <p className="font-semibold">{data.personalInfo.name || 'Not provided'}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Patient ID</Label>
                                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                    P{user?.id}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                                {isEditing ? (
                                    <Input
                                        value={data.personalInfo.age}
                                        onChange={(e) => updateField('personalInfo', 'age', e.target.value)}
                                        placeholder="e.g., 32"
                                    />
                                ) : (
                                    <p className="font-semibold">{data.personalInfo.age || 'Not provided'}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                                {isEditing ? (
                                    <Select value={data.personalInfo.gender} onValueChange={(v) => updateField('personalInfo', 'gender', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-semibold">{data.personalInfo.gender || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                                    <p className="font-semibold">{data.personalInfo.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    <p className="font-semibold">{data.personalInfo.email || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label className="text-sm font-medium text-muted-foreground">PIN Code</Label>
                                    {isEditing ? (
                                        <Input
                                            value={data.personalInfo.pinCode}
                                            onChange={(e) => updateField('personalInfo', 'pinCode', e.target.value)}
                                            placeholder="e.g., 400001"
                                        />
                                    ) : (
                                        <p className="font-semibold">{data.personalInfo.pinCode || 'Not provided'}</p>
                                    )}
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
                                <Label className="text-sm font-medium text-muted-foreground">Blood Group</Label>
                                {isEditing ? (
                                    <Select value={data.medicalInfo.bloodGroup} onValueChange={(v) => updateField('medicalInfo', 'bloodGroup', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-semibold">{data.medicalInfo.bloodGroup || 'Not provided'}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">ABHA ID</Label>
                                {isEditing ? (
                                    <Input
                                        value={data.medicalInfo.abhaId}
                                        onChange={(e) => updateField('medicalInfo', 'abhaId', e.target.value)}
                                        placeholder="ABHA-XXXXXXXXXX"
                                    />
                                ) : (
                                    <p className="font-mono text-sm">{data.medicalInfo.abhaId || 'Not provided'}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Height (cm)</Label>
                                {isEditing ? (
                                    <Input
                                        value={data.medicalInfo.height}
                                        onChange={(e) => updateField('medicalInfo', 'height', e.target.value)}
                                        placeholder="e.g., 175"
                                    />
                                ) : (
                                    <p className="font-semibold">{data.medicalInfo.height || 'Not provided'}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Weight (kg)</Label>
                                {isEditing ? (
                                    <Input
                                        value={data.medicalInfo.weight}
                                        onChange={(e) => updateField('medicalInfo', 'weight', e.target.value)}
                                        placeholder="e.g., 70"
                                    />
                                ) : (
                                    <p className="font-semibold">{data.medicalInfo.weight || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Known Allergies</Label>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    {data.medicalInfo.allergies.length > 0 ? data.medicalInfo.allergies.map((allergy: string, idx: number) => (
                                        <Badge key={idx} variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {allergy}
                                            {isEditing && (
                                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('medicalInfo', 'allergies', idx)} />
                                            )}
                                        </Badge>
                                    )) : <p className="text-sm text-muted-foreground">None reported</p>}
                                </div>
                                {isEditing && (
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            id="new-allergy"
                                            placeholder="Add allergy"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addArrayItem('medicalInfo', 'allergies', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button size="sm" variant="outline" onClick={() => {
                                            const input = document.getElementById('new-allergy') as HTMLInputElement;
                                            addArrayItem('medicalInfo', 'allergies', input.value);
                                            input.value = '';
                                        }}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Medical Conditions</Label>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    {data.medicalInfo.medicalConditions.length > 0 ? data.medicalInfo.medicalConditions.map((condition: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {condition}
                                            {isEditing && (
                                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeArrayItem('medicalInfo', 'medicalConditions', idx)} />
                                            )}
                                        </Badge>
                                    )) : <p className="text-sm text-muted-foreground">None reported</p>}
                                </div>
                                {isEditing && (
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            id="new-condition"
                                            placeholder="Add condition"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addArrayItem('medicalInfo', 'medicalConditions', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button size="sm" variant="outline" onClick={() => {
                                            const input = document.getElementById('new-condition') as HTMLInputElement;
                                            addArrayItem('medicalInfo', 'medicalConditions', input.value);
                                            input.value = '';
                                        }}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
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
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Contact Name</Label>
                            {isEditing ? (
                                <Input
                                    value={data.emergencyContact.name}
                                    onChange={(e) => updateField('emergencyContact', 'name', e.target.value)}
                                    placeholder="Enter name"
                                />
                            ) : (
                                <p className="font-semibold">{data.emergencyContact.name || 'Not provided'}</p>
                            )}
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Relation</Label>
                            {isEditing ? (
                                <Input
                                    value={data.emergencyContact.relation}
                                    onChange={(e) => updateField('emergencyContact', 'relation', e.target.value)}
                                    placeholder="e.g., Spouse, Parent, Sibling"
                                />
                            ) : (
                                <p className="font-semibold">{data.emergencyContact.relation || 'Not provided'}</p>
                            )}
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                            {isEditing ? (
                                <Input
                                    value={data.emergencyContact.phone}
                                    onChange={(e) => updateField('emergencyContact', 'phone', e.target.value)}
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            ) : (
                                <p className="font-semibold">{data.emergencyContact.phone || 'Not provided'}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfileView;