import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, User, Activity, Languages, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface OnboardingWizardProps {
    isOpen: boolean;
    onComplete: () => void;
}

const OnboardingWizard = ({ isOpen, onComplete }: OnboardingWizardProps) => {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        // Step 0: Language & Consent
        language: 'english',
        consent: false,

        // Step 1: Basic Profile
        age: '', // Range: Below 12, 12-18, 19-40, 41-60, Above 60
        gender: '',
        isPregnant: false,
        isBreastfeeding: false,
        pinCode: '',

        // Step 2: Medical History
        drugAllergies: false,
        allergyDetails: '',
        foodAllergies: false,
        foodAllergyDetails: '',
        medicalConditions: [] as string[],
        otherCondition: '',
        abhaId: '',
        currentMedicines: false, // "Are you taking any other medicines?"
        currentMedicineDetails: ''
    });

    const updateData = (field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleConditionToggle = (condition: string) => {
        if (data.medicalConditions.includes(condition)) {
            setData(prev => ({
                ...prev,
                medicalConditions: prev.medicalConditions.filter(c => c !== condition)
            }));
        } else {
            setData(prev => ({
                ...prev,
                medicalConditions: [...prev.medicalConditions, condition]
            }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!user?.id) throw new Error("User not found");

            // Prepare final data
            const profilePayload = {
                ...data,
                medicalConditions: data.otherCondition
                    ? [...data.medicalConditions, `Other: ${data.otherCondition}`]
                    : data.medicalConditions
            };

            await authAPI.updateProfile(Number(user.id), profilePayload);

            // Update local storage to reflect profile complete
            const storedProfile = localStorage.getItem('profile');
            const newProfile = storedProfile ? JSON.parse(storedProfile) : {};
            newProfile.profile_complete = true;
            localStorage.setItem('profile', JSON.stringify(newProfile));

            toast.success("Profile setup complete!");
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: "Welcome & Language",
            icon: Languages,
            render: () => (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">Please choose your language / कृपया भाषा चुनें</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {['English', 'हिंदी', 'தமிழ்', 'বাংলা'].map((lang) => (
                            <Button
                                key={lang}
                                variant={data.language === lang.toLowerCase() ? 'default' : 'outline'}
                                className="h-12 text-lg"
                                onClick={() => updateData('language', lang.toLowerCase())}
                            >
                                {lang}
                            </Button>
                        ))}
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-4 border">
                        <div className="flex gap-3">
                            <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                            <p className="text-sm leading-relaxed">
                                I will ask a few questions to understand your medicine experience.
                                This helps improve medicine safety.
                                Do you agree to continue?
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant={data.consent ? "default" : "outline"}
                                onClick={() => updateData('consent', true)}
                                className="w-32 gap-2"
                            >
                                <CheckCircle className="h-4 w-4" /> Yes
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-32 text-muted-foreground"
                                onClick={() => toast.info("Consent is required to proceed.")}
                            >
                                ❌ No
                            </Button>
                        </div>
                    </div>
                </div>
            ),
            canNext: () => data.consent && data.language
        },
        {
            title: "Basic Profile",
            icon: User,
            render: () => (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-4">
                        <Label>What is your age?</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {['Below 12', '12–18', '19–40', '41–60', 'Above 60'].map((range) => (
                                <Button
                                    key={range}
                                    variant={data.age === range ? 'default' : 'outline'}
                                    onClick={() => updateData('age', range)}
                                    className="h-10"
                                >
                                    {range}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Select your gender</Label>
                        <div className="flex gap-4">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <Button
                                    key={g}
                                    variant={data.gender === g.toLowerCase() ? 'default' : 'outline'}
                                    onClick={() => updateData('gender', g.toLowerCase())}
                                    className="flex-1"
                                >
                                    {g}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {data.gender === 'female' && ['12–18', '19–40', '41–60'].includes(data.age) && (
                        <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <Label>Are you currently pregnant or breastfeeding?</Label>
                            <RadioGroup
                                value={data.isPregnant ? 'pregnant' : data.isBreastfeeding ? 'breastfeeding' : 'no'}
                                onValueChange={(val) => {
                                    if (val === 'pregnant') { updateData('isPregnant', true); updateData('isBreastfeeding', false); }
                                    else if (val === 'breastfeeding') { updateData('isPregnant', false); updateData('isBreastfeeding', true); }
                                    else { updateData('isPregnant', false); updateData('isBreastfeeding', false); }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pregnant" id="preg" />
                                    <Label htmlFor="preg">Pregnant</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="breastfeeding" id="breast" />
                                    <Label htmlFor="breast">Breastfeeding</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="no" />
                                    <Label htmlFor="no">No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Enter your area PIN code</Label>
                        <Input
                            value={data.pinCode}
                            onChange={(e) => updateData('pinCode', e.target.value)}
                            placeholder="6-digit PIN"
                            maxLength={6}
                            pattern="[0-9]*"
                        />
                    </div>
                </div>
            ),
            canNext: () => data.age && data.gender && data.pinCode.length === 6
        },
        {
            title: "Medical History",
            icon: Activity,
            render: () => (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {/* Drug Allergies */}
                    <div className="space-y-3">
                        <Label>Do you have any medicine allergies?</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={data.drugAllergies ? 'default' : 'outline'}
                                onClick={() => updateData('drugAllergies', true)}
                                className="flex-1"
                            >
                                Yes
                            </Button>
                            <Button
                                variant={!data.drugAllergies ? 'default' : 'outline'}
                                onClick={() => { updateData('drugAllergies', false); updateData('allergyDetails', ''); }}
                                className="flex-1"
                            >
                                No / Not Sure
                            </Button>
                        </div>
                        {data.drugAllergies && (
                            <Input
                                placeholder="Which medicine caused allergy earlier?"
                                value={data.allergyDetails}
                                onChange={(e) => updateData('allergyDetails', e.target.value)}
                            />
                        )}
                    </div>

                    {/* Food Allergies */}
                    <div className="space-y-3">
                        <Label>Any food or other allergies?</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={data.foodAllergies ? 'default' : 'outline'}
                                onClick={() => updateData('foodAllergies', true)}
                                className="flex-1"
                            >
                                Yes
                            </Button>
                            <Button
                                variant={!data.foodAllergies ? 'default' : 'outline'}
                                onClick={() => { updateData('foodAllergies', false); updateData('foodAllergyDetails', ''); }}
                                className="flex-1"
                            >
                                No
                            </Button>
                        </div>
                        {data.foodAllergies && (
                            <Input
                                placeholder="Details (e.g., Peanuts, Dust)"
                                value={data.foodAllergyDetails}
                                onChange={(e) => updateData('foodAllergyDetails', e.target.value)}
                            />
                        )}
                    </div>

                    {/* Conditions */}
                    <div className="space-y-3">
                        <Label>Do you have any long-term illness?</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Diabetes', 'Blood Pressure', 'Asthma', 'Kidney Problem', 'Liver Problem', 'Heart Disease'].map(c => (
                                <div key={c} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={c}
                                        checked={data.medicalConditions.includes(c)}
                                        onCheckedChange={() => handleConditionToggle(c)}
                                    />
                                    <Label htmlFor={c} className="font-normal">{c}</Label>
                                </div>
                            ))}
                        </div>
                        <Input
                            placeholder="Other (type here)..."
                            value={data.otherCondition}
                            onChange={(e) => updateData('otherCondition', e.target.value)}
                        />
                    </div>

                    {/* ABHA */}
                    <div className="space-y-2">
                        <Label>ENTER ABHA ID (optional):</Label>
                        <Input
                            value={data.abhaId}
                            onChange={(e) => updateData('abhaId', e.target.value)}
                            placeholder="e.g. 12-3456-7890-1234"
                        />
                    </div>

                    {/* Other Medicines */}
                    <div className="space-y-3">
                        <Label>Are you taking any other medicines right now?</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={data.currentMedicines ? 'default' : 'outline'}
                                onClick={() => updateData('currentMedicines', true)}
                                className="flex-1"
                            >
                                Yes
                            </Button>
                            <Button
                                variant={!data.currentMedicines ? 'default' : 'outline'}
                                onClick={() => { updateData('currentMedicines', false); updateData('currentMedicineDetails', ''); }}
                                className="flex-1"
                            >
                                No / Not Sure
                            </Button>
                        </div>
                        {data.currentMedicines && (
                            <Textarea
                                placeholder="Please tell the names (or upload photo)"
                                value={data.currentMedicineDetails}
                                onChange={(e) => updateData('currentMedicineDetails', e.target.value)}
                            />
                        )}
                    </div>
                </div>
            ),
            canNext: () => true // All optional basically
        }
    ];

    const CurrentStepIcon = steps[step].icon;

    return (
        <Dialog open={isOpen} modal={true}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <CurrentStepIcon className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle>{steps[step].title}</DialogTitle>
                    </div>
                    <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
                </DialogHeader>

                <div className="py-4">
                    {steps[step].render()}
                </div>

                <div className="flex justify-between items-center pt-4 border-t mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                    >
                        Back
                    </Button>

                    {step < steps.length - 1 ? (
                        <Button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!steps[step].canNext()}
                            className="gap-2"
                        >
                            Continue <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !steps[step].canNext()}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            {loading ? 'Saving...' : 'Complete Profile'} <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingWizard;
