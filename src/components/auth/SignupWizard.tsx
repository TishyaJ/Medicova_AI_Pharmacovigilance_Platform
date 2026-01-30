import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Send, CheckCircle2, User, Building, FileText } from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { roleCards } from './LoginTab';

const SignupWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    // Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [extraField1, setExtraField1] = useState(''); // Age/License/EmpID
    const [extraField2, setExtraField2] = useState(''); // Gender/Specialization/Shop/Secret

    const handleVerifyMobile = () => {
        if (phoneNumber.length < 10) return toast.error("Invalid phone number");
        if (otp !== '123456') return toast.error("Invalid OTP (Use 123456)");
        setIsVerified(true);
        setStep(2);
        toast.success("Mobile Verified!");
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setStep(3);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        try {
            const payload = {
                phone_number: phoneNumber,
                role: selectedRole,
                full_name: name,
                email: email,
                password_hash: password,
            };

            await api.post('/auth/signup', payload);

            toast.success("Registration Successful! Please Login.");
            window.location.reload();
        } catch (error: any) {
            console.error(error);

            // If backend is not available, show helpful message and allow mock login
            if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
                toast.info("Backend not running. You can still test with mock login!", {
                    duration: 4000,
                });
                // Switch to login tab after a delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(error.response?.data?.detail || "Registration Failed");
            }
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
        <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <div className="text-center mb-6">
                <h3 className="font-semibold">Step 3: Profile Details</h3>
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

            {/* Dynamic Fields */}
            {selectedRole === 'patient' && (
                <>
                    <div className="space-y-2">
                        <Label>Age</Label>
                        <Input value={extraField1} onChange={e => setExtraField1(e.target.value)} type="number" placeholder="25" />
                    </div>
                    <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input value={extraField2} onChange={e => setExtraField2(e.target.value)} placeholder="100001" />
                    </div>
                </>
            )}

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

            <Button type="submit" className="w-full btn-medical-primary">
                Complete Registration
            </Button>
        </form>
    );

    return (
        <div>
            {/* Progress Indicator */}
            <div className="flex gap-2 mb-6 justify-center" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label="Registration progress">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
                        aria-label={`Step ${i}${i === step ? ' - current' : i < step ? ' - completed' : ' - upcoming'}`}
                    />
                ))}
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </div>
    );
};

export default SignupWizard;
