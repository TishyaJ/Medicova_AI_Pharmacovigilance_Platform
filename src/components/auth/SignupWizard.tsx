import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
    Smartphone,
    Send,
    CheckCircle2,
    User,
    Building,
    FileText,
    Languages,
    MapPin,
    Activity,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { roleCards } from './LoginTab';

interface ProfileData {
    // Phase 0: Language & Consent
    language: string;
    consent: boolean;

    // Phase 1: Basic Profile
    age: string;
    gender: string;
    isPregnant?: boolean;
    isBreastfeeding?: boolean;
    pinCode: string;

    // Phase 2: Medical History
    drugAllergies: boolean;
    allergyDetails: string;
    foodAllergies: boolean;
    foodAllergyDetails: string;
    medicalConditions: string[];
    abhaId: string;
    currentMedicines: boolean;
    currentMedicineDetails: string;
}

const SignupWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    // Basic Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [extraField1, setExtraField1] = useState(''); // Age/License/EmpID
    const [extraField2, setExtraField2] = useState(''); // Gender/Specialization/Shop/Secret

    // Patient Profile Data (for comprehensive setup)
    const [profileData, setProfileData] = useState<ProfileData>({
        language: '',
        consent: false,
        age: '',
        gender: '',
        pinCode: '',
        drugAllergies: false,
        allergyDetails: '',
        foodAllergies: false,
        foodAllergyDetails: '',
        medicalConditions: [],
        abhaId: '',
        currentMedicines: false,
        currentMedicineDetails: ''
    });

    const updateProfileData = (field: keyof ProfileData, value: any) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const getTotalSteps = () => {
        return selectedRole === 'patient' ? 9 : 3; // 9 steps for patients, 3 for others
    };

    const handleVerifyMobile = () => {
        if (phoneNumber.length < 10) return toast.error("Invalid phone number");
        if (otp !== '123456') return toast.error("Invalid OTP (Use 123456)");
        setIsVerified(true);
        setStep(2);
        toast.success("Mobile Verified!");
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        // All roles go to step 3 for basic details (name, email, password)
        setStep(3);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        // Validate required fields
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill in all required fields (Name, Email, Password)");
            return;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please provide a valid phone number");
            return;
        }

        try {
            const payload = {
                phone_number: phoneNumber,
                role: selectedRole,
                full_name: name.trim(),
                email: email.trim(),
                password_hash: password,
                // Include profile data for patients
                ...(selectedRole === 'patient' && { profile_data: profileData })
            };

            const result = await authAPI.signup(payload);

            // Mark profile as complete for patients
            if (selectedRole === 'patient') {
                localStorage.setItem(`profile_complete_patient`, 'true');
                localStorage.setItem(`profile_data_patient`, JSON.stringify(profileData));
            }

            toast.success("Registration Successful! Please Login.");
            window.location.reload();
        } catch (error: any) {
            console.error('Signup error:', error);

            if (error.response?.status === 400) {
                const errorMsg = error.response.data.detail || "Registration failed";
                if (errorMsg.includes("already registered") || errorMsg.includes("already exists")) {
                    toast.error("This email or phone number is already registered. Please use different credentials or try logging in.", {
                        duration: 5000,
                    });
                } else {
                    toast.error(errorMsg);
                }
            } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
                // Backend not available - show helpful message
                toast.error("Backend server is not running. Please start the backend first.", {
                    duration: 5000,
                });
            } else {
                toast.error(error.response?.data?.detail || "Registration Failed");
            }
        }
    };

    const nextStep = () => {
        if (step < getTotalSteps()) {
            setStep((prev) => (prev + 1) as any);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep((prev) => (prev - 1) as any);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return otp.length === 6;
            case 2: return selectedRole !== null;
            case 3: return name.trim() !== '' && email.trim() !== '' && password.trim() !== '';
            case 4: return profileData.language !== '';
            case 5: return profileData.consent;
            case 6: return profileData.age !== '';
            case 7: return profileData.gender !== '';
            case 8: return profileData.pinCode.length === 6;
            case 9: return true; // Medical history is optional
            default: return true;
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <div className="text-center mb-6">
                <h3 className="font-semibold">Step 1: Mobile Verification</h3>
                <p className="text-sm text-muted-foreground">We need your number to secure your account</p>
            </div>

            <div className="space-y-2">
                <Label>Mobile Number</Label>
                <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="OTP"
                    className="text-center tracking-widest"
                    maxLength={6}
                />
                <Button onClick={() => toast.info("OTP sent: 123456")} variant="outline">
                    Get OTP
                </Button>
            </div>

            <Button onClick={handleVerifyMobile} className="w-full btn-medical-primary" disabled={otp.length !== 6}>
                Verify & Continue
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <div className="text-center mb-6">
                <h3 className="font-semibold">Step 2: Select Your Role</h3>
                <p className="text-sm text-muted-foreground">How will you use Medicova?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {roleCards.map((card) => (
                    <button
                        key={card.role}
                        onClick={() => handleRoleSelect(card.role)}
                        className={`flex flex-col items-center p-4 rounded-lg border transition-all hover:shadow-md ${card.color} ${selectedRole === card.role ? 'ring-2 ring-primary' : ''}`}
                    >
                        <card.icon className="h-8 w-8 mb-2" />
                        <span className="font-bold text-sm">{card.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <form onSubmit={selectedRole === 'patient' ? (e) => { e.preventDefault(); nextStep(); } : handleSignup} className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <div className="text-center mb-6">
                <h3 className="font-semibold">Step 3: Basic Details</h3>
                <p className="text-sm text-muted-foreground">Complete your {selectedRole} profile</p>
            </div>

            <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="pl-10" required />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" required />
            </div>

            <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="******" required />
            </div>

            {/* Dynamic Fields for non-patient roles */}
            {selectedRole === 'doctor' && (
                <>
                    <div className="space-y-2">
                        <Label>Medical License ID</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={extraField1} onChange={e => setExtraField1(e.target.value)} placeholder="MD-12345" className="pl-10" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Input value={extraField2} onChange={e => setExtraField2(e.target.value)} placeholder="Cardiologist" />
                    </div>
                </>
            )}

            {selectedRole === 'pharmacist' && (
                <>
                    <div className="space-y-2">
                        <Label>Shop Name</Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={extraField2} onChange={e => setExtraField2(e.target.value)} placeholder="City Pharmacy" className="pl-10" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Pharmacy License</Label>
                        <Input value={extraField1} onChange={e => setExtraField1(e.target.value)} placeholder="PH-9999" />
                    </div>
                </>
            )}

            {selectedRole === 'admin' && (
                <>
                    <div className="space-y-2">
                        <Label>Employee ID</Label>
                        <Input value={extraField1} onChange={e => setExtraField1(e.target.value)} placeholder="EMP-001" />
                    </div>
                    <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <Input type="password" value={extraField2} onChange={e => setExtraField2(e.target.value)} placeholder="******" />
                    </div>
                </>
            )}

            <Button type="submit" className="w-full btn-medical-primary" disabled={!canProceed()}>
                {selectedRole === 'patient' ? 'Continue to Profile Setup' : 'Complete Registration'}
            </Button>
        </form>
    );

    // Patient Profile Setup Steps (4-9)
    const renderStep4 = () => (
        <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-8">
            <div className="space-y-4">
                <Languages className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Please choose your language</h3>
                <p className="text-lg text-muted-foreground">कृपया भाषा चुनें</p>
            </div>

            <div className="grid gap-3 max-w-sm mx-auto">
                <Button
                    variant={profileData.language === 'english' ? 'default' : 'outline'}
                    onClick={() => updateProfileData('language', 'english')}
                    className="h-12 text-base"
                >
                    English
                </Button>
                <Button
                    variant={profileData.language === 'hindi' ? 'default' : 'outline'}
                    onClick={() => updateProfileData('language', 'hindi')}
                    className="h-12 text-base"
                >
                    हिंदी
                </Button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Consent</h3>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-base leading-relaxed">
                        I will ask a few questions to understand your medicine experience.
                        This helps improve medicine safety.
                    </p>
                    <p className="text-base font-medium mt-4">
                        Do you agree to continue?
                    </p>
                </div>
            </div>

            <div className="grid gap-3 max-w-sm mx-auto">
                <Button
                    variant={profileData.consent ? 'default' : 'outline'}
                    onClick={() => updateProfileData('consent', true)}
                    className="h-12 text-base flex items-center gap-2"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    ✅ Yes
                </Button>
                <Button
                    variant={!profileData.consent ? 'destructive' : 'outline'}
                    onClick={() => updateProfileData('consent', false)}
                    className="h-12 text-base"
                >
                    ❌ No
                </Button>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-4">What is your age?</h3>
            </div>

            <div className="grid gap-3 max-w-sm mx-auto">
                {['Below 12', '12–18', '19–40', '41–60', 'Above 60'].map((ageRange) => (
                    <Button
                        key={ageRange}
                        variant={profileData.age === ageRange ? 'default' : 'outline'}
                        onClick={() => updateProfileData('age', ageRange)}
                        className="h-12 text-base"
                    >
                        {ageRange}
                    </Button>
                ))}
            </div>
        </div>
    );

    const renderStep7 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-4">Select your gender</h3>
            </div>

            <div className="grid gap-3 max-w-sm mx-auto">
                {['Male', 'Female', 'Other / Prefer not to say'].map((gender) => (
                    <Button
                        key={gender}
                        variant={profileData.gender === gender ? 'default' : 'outline'}
                        onClick={() => updateProfileData('gender', gender)}
                        className="h-12 text-base"
                    >
                        {gender}
                    </Button>
                ))}
            </div>

            {/* Pregnancy/Breastfeeding for females */}
            {profileData.gender === 'Female' && profileData.age !== 'Below 12' && profileData.age !== 'Above 60' && (
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-center font-medium">Are you currently pregnant or breastfeeding?</h4>
                    <div className="grid gap-2 max-w-sm mx-auto">
                        <Button
                            variant={profileData.isPregnant === true ? 'default' : 'outline'}
                            onClick={() => {
                                updateProfileData('isPregnant', true);
                                updateProfileData('isBreastfeeding', false);
                            }}
                            className="h-10 text-sm"
                        >
                            Pregnant
                        </Button>
                        <Button
                            variant={profileData.isBreastfeeding === true ? 'default' : 'outline'}
                            onClick={() => {
                                updateProfileData('isBreastfeeding', true);
                                updateProfileData('isPregnant', false);
                            }}
                            className="h-10 text-sm"
                        >
                            Breastfeeding
                        </Button>
                        <Button
                            variant={profileData.isPregnant === false && profileData.isBreastfeeding === false ? 'default' : 'outline'}
                            onClick={() => {
                                updateProfileData('isPregnant', false);
                                updateProfileData('isBreastfeeding', false);
                            }}
                            className="h-10 text-sm"
                        >
                            No
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep8 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-4">Enter your area PIN code</h3>
                <p className="text-muted-foreground">This helps us track regional safety patterns</p>
            </div>

            <div className="max-w-sm mx-auto">
                <Input
                    type="text"
                    placeholder="Enter 6-digit PIN code"
                    value={profileData.pinCode}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        updateProfileData('pinCode', value);
                    }}
                    className="h-12 text-center text-lg"
                    maxLength={6}
                />
            </div>
        </div>
    );

    const renderStep9 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-4">Medical History (Optional)</h3>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-4">
                    <h4 className="font-medium">Do you have any medicine allergies?</h4>
                    <div className="grid gap-2">
                        <Button
                            variant={profileData.drugAllergies === true ? 'default' : 'outline'}
                            onClick={() => updateProfileData('drugAllergies', true)}
                            className="h-10"
                        >
                            Yes
                        </Button>
                        <Button
                            variant={profileData.drugAllergies === false ? 'default' : 'outline'}
                            onClick={() => updateProfileData('drugAllergies', false)}
                            className="h-10"
                        >
                            No
                        </Button>
                    </div>

                    {profileData.drugAllergies && (
                        <Textarea
                            placeholder="Which medicine caused allergy earlier?"
                            value={profileData.allergyDetails}
                            onChange={(e) => updateProfileData('allergyDetails', e.target.value)}
                            rows={3}
                        />
                    )}
                </div>

                <div className="space-y-4">
                    <h4 className="font-medium">Do you have any long-term illness?</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {['Diabetes', 'Blood Pressure', 'Asthma', 'Kidney problem', 'Liver problem', 'Heart disease'].map((condition) => (
                            <div key={condition} className="flex items-center space-x-2">
                                <Checkbox
                                    id={condition}
                                    checked={profileData.medicalConditions.includes(condition)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            updateProfileData('medicalConditions', [...profileData.medicalConditions, condition]);
                                        } else {
                                            updateProfileData('medicalConditions', profileData.medicalConditions.filter(c => c !== condition));
                                        }
                                    }}
                                />
                                <Label htmlFor={condition} className="text-sm">{condition}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Label htmlFor="abha">ABHA ID (Optional)</Label>
                    <Input
                        id="abha"
                        placeholder="Enter your ABHA ID"
                        value={profileData.abhaId}
                        onChange={(e) => updateProfileData('abhaId', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {/* Progress Indicator */}
            <div className="flex gap-2 mb-6 justify-center" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={getTotalSteps()} aria-label="Registration progress">
                {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map(i => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
                        aria-label={`Step ${i}${i === step ? ' - current' : i < step ? ' - completed' : ' - upcoming'}`}
                    />
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                {step === 6 && renderStep6()}
                {step === 7 && renderStep7()}
                {step === 8 && renderStep8()}
                {step === 9 && renderStep9()}
            </div>

            {/* Navigation Buttons for Patient Profile Steps */}
            {selectedRole === 'patient' && step >= 4 && (
                <div className="flex justify-between pt-6 border-t mt-6">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 4}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    {step === 9 ? (
                        <Button
                            onClick={handleSignup}
                            disabled={!canProceed()}
                            className="flex items-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Complete Registration
                        </Button>
                    ) : (
                        <Button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className="flex items-center gap-2"
                        >
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SignupWizard;
