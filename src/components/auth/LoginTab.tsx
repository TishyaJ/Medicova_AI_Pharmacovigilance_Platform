import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, Shield, Stethoscope, Pill, UserCheck, Smartphone, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

export const roleCards: { role: UserRole; icon: any; label: string; description: string; color: string }[] = [
    {
        role: 'doctor',
        icon: Stethoscope,
        label: 'Doctor',
        description: 'Review cases & guide patients',
        color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
    },
    {
        role: 'pharmacist',
        icon: Pill,
        label: 'Pharmacist',
        description: 'Manage medicine queries',
        color: 'bg-green-100 text-green-600 hover:bg-green-200'
    },
    {
        role: 'patient',
        icon: UserCheck,
        label: 'Patient',
        description: 'Report symptoms & get help',
        color: 'bg-purple-100 text-purple-600 hover:bg-purple-200'
    },
    {
        role: 'admin',
        icon: Shield,
        label: 'Admin',
        description: 'System management',
        color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    },
];

const LoginTab = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

    // State
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        try {
            if (selectedRole === 'patient' && loginMethod === 'otp') {
                if (!otpSent) return;
                if (otp.length !== 6) {
                    toast.error("Please enter a valid 6-digit OTP");
                    return;
                }
            }

            // Use real API for login
            const credentials = {
                email: email || `${selectedRole}@medicova.com`,
                password_hash: password || 'demo123'
            };

            const result = await authAPI.login(credentials);

            // Store user data
            localStorage.setItem('user', JSON.stringify(result.user));
            if (result.profile) {
                localStorage.setItem('profile', JSON.stringify(result.profile));
            }

            login(result.user.email, result.user.password_hash, result.user.role);
            toast.success(`Welcome back, ${result.user.full_name}!`);
            navigate(`/${selectedRole}`);

        } catch (error: any) {
            console.error('Login error:', error);

            if (error.response?.status === 401) {
                toast.error("Invalid email or password");
            } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
                // Fallback to mock login if backend is not available
                toast.warning("Backend not available. Using mock login for testing.");
                login(email || `${selectedRole}@medicova.com`, password || 'demo123', selectedRole);
                navigate(`/${selectedRole}`);
            } else {
                toast.error(error.response?.data?.detail || "Login failed");
            }
        }
    };

    const handleSendOtp = () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }
        setOtpSent(true);
        toast.success(`OTP sent to ${phoneNumber}`);
        setTimeout(() => {
            toast.info("Demo OTP: 123456");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center relative">
                {selectedRole && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-0 -ml-2 -mt-2"
                        onClick={() => {
                            setSelectedRole(null);
                            setLoginMethod('password');
                            setOtpSent(false);
                        }}
                        aria-label="Go back to role selection"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}

                <h2 className="text-xl font-semibold">
                    {selectedRole ? `${t(selectedRole)} Login` : "Select Your Role"}
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-1">
                    {selectedRole
                        ? "Please sign in to continue"
                        : "Who are you logging in as?"}
                </p>
            </div>

            {!selectedRole ? (
                <div className="grid grid-cols-2 gap-4" role="group" aria-label="User role selection">
                    {roleCards.map((card) => (
                        <button
                            key={card.role}
                            onClick={() => setSelectedRole(card.role)}
                            className={`flex flex-col items-center p-6 rounded-xl border-2 border-transparent transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${card.color}`}
                            aria-label={`Login as ${card.label}: ${card.description}`}
                        >
                            <card.icon className="h-10 w-10 mb-3" aria-hidden="true" />
                            <span className="font-bold text-lg">{card.label}</span>
                            <span className="text-xs text-center mt-1 opacity-80">{card.description}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {selectedRole === 'patient' && (
                        <div className="flex p-1 bg-muted rounded-lg mb-6" role="tablist" aria-label="Login method">
                            <button
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'password' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setLoginMethod('password')}
                                role="tab"
                                aria-selected={loginMethod === 'password'}
                                aria-label="Login with password"
                            >
                                Password
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'otp' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setLoginMethod('otp')}
                                role="tab"
                                aria-selected={loginMethod === 'otp'}
                                aria-label="Login with OTP"
                            >
                                OTP Login
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5" noValidate>
                        {loginMethod === 'password' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('email')}</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 pl-10"
                                            aria-required="true"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('password')}</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 pl-10"
                                            aria-required="true"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="h-12 pl-10"
                                            disabled={otpSent}
                                            aria-required="true"
                                            autoComplete="tel"
                                        />
                                    </div>
                                </div>

                                {otpSent && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="otp">Enter OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="000000"
                                            className="h-12 text-center text-2xl tracking-widest"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            aria-required="true"
                                            aria-describedby="otp-help"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                        />
                                        <p id="otp-help" className="text-xs text-muted-foreground">
                                            Enter the 6-digit code sent to your phone
                                        </p>
                                    </div>
                                )}

                                {!otpSent && (
                                    <Button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="w-full h-12"
                                        variant="secondary"
                                        aria-label="Send OTP to phone number"
                                    >
                                        <Send className="mr-2 h-4 w-4" /> Send OTP
                                    </Button>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="btn-medical-primary h-12 w-full gap-2 text-base"
                            aria-label={loginMethod === 'otp' ? 'Verify OTP and login' : 'Login to account'}
                        >
                            <LogIn className="h-5 w-5" />
                            {loginMethod === 'otp' ? 'Verify to Login' : t('login')}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LoginTab;
