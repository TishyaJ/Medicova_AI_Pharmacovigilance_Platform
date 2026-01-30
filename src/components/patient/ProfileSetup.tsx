import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
    Languages,
    User,
    MapPin,
    Activity,
    Pill,
    CheckCircle,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

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

interface ProfileSetupProps {
    onComplete: (data: ProfileData) => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<ProfileData>({
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

    const totalSteps = 8; // 0: Language, 1: Consent, 2: Age, 3: Gender, 4: Pregnancy, 5: Location, 6: Allergies, 7: Medical History

    const updateData = (field: keyof ProfileData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        onComplete(data);
        toast.success('Profile setup completed successfully!');
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return data.language !== '';
            case 1: return data.consent;
            case 2: return data.age !== '';
            case 3: return data.gender !== '';
            case 4: return data.gender !== 'female' || (data.isPregnant !== undefined || data.isBreastfeeding !== undefined);
            case 5: return data.pinCode.length === 6;
            case 6: return true; // Allergies are optional
            case 7: return true; // Medical history is optional
            default: return true;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 0: return 'Language Selection';
            case 1: return 'Consent';
            case 2: return 'Age Information';
            case 3: return 'Gender';
            case 4: return 'Pregnancy/Breastfeeding';
            case 5: return 'Location';
            case 6: return 'Allergy Information';
            case 7: return 'Medical History';
            default: return 'Setup';
        }
    };

    const getStepIcon = () => {
        switch (currentStep) {
            case 0: return <Languages className="h-6 w-6" />;
            case 1: return <CheckCircle className="h-6 w-6" />;
            case 2: case 3: case 4: return <User className="h-6 w-6" />;
            case 5: return <MapPin className="h-6 w-6" />;
            case 6: case 7: return <Activity className="h-6 w-6" />;
            default: return <User className="h-6 w-6" />;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0: // Language Selection
                return (
                    <div className="space-y-6 text-center">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Please choose your language</h3>
                            <p className="text-lg text-muted-foreground">कृपया भाषा चुनें</p>
                        </div>

                        <div className="grid gap-3 max-w-sm mx-auto">
                            <Button
                                variant={data.language === 'english' ? 'default' : 'outline'}
                                onClick={() => updateData('language', 'english')}
                                className="h-12 text-base"
                            >
                                English
                            </Button>
                            <Button
                                variant={data.language === 'hindi' ? 'default' : 'outline'}
                                onClick={() => updateData('language', 'hindi')}
                                className="h-12 text-base"
                            >
                                हिंदी
                            </Button>
                        </div>
                    </div>
                );

            case 1: // Consent
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
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
                                variant={data.consent ? 'default' : 'outline'}
                                onClick={() => updateData('consent', true)}
                                className="h-12 text-base flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                ✅ Yes
                            </Button>
                            <Button
                                variant={!data.consent ? 'destructive' : 'outline'}
                                onClick={() => updateData('consent', false)}
                                className="h-12 text-base"
                            >
                                ❌ No
                            </Button>
                        </div>
                    </div>
                );

            case 2: // Age
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">What is your age?</h3>
                        </div>

                        <div className="grid gap-3 max-w-sm mx-auto">
                            {['Below 12', '12–18', '19–40', '41–60', 'Above 60'].map((ageRange) => (
                                <Button
                                    key={ageRange}
                                    variant={data.age === ageRange ? 'default' : 'outline'}
                                    onClick={() => updateData('age', ageRange)}
                                    className="h-12 text-base"
                                >
                                    {ageRange}
                                </Button>
                            ))}
                        </div>
                    </div>
                );

            case 3: // Gender
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">Select your gender</h3>
                        </div>

                        <div className="grid gap-3 max-w-sm mx-auto">
                            {['Male', 'Female', 'Other / Prefer not to say'].map((gender) => (
                                <Button
                                    key={gender}
                                    variant={data.gender === gender ? 'default' : 'outline'}
                                    onClick={() => updateData('gender', gender)}
                                    className="h-12 text-base"
                                >
                                    {gender}
                                </Button>
                            ))}
                        </div>
                    </div>
                );

            case 4: // Pregnancy/Breastfeeding (only if female and age 12-55)
                if (data.gender !== 'Female' || data.age === 'Below 12' || data.age === 'Above 60') {
                    // Skip this step
                    nextStep();
                    return null;
                }

                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">Are you currently pregnant or breastfeeding?</h3>
                        </div>

                        <div className="grid gap-3 max-w-sm mx-auto">
                            <Button
                                variant={data.isPregnant === true ? 'default' : 'outline'}
                                onClick={() => {
                                    updateData('isPregnant', true);
                                    updateData('isBreastfeeding', false);
                                }}
                                className="h-12 text-base"
                            >
                                Pregnant
                            </Button>
                            <Button
                                variant={data.isBreastfeeding === true ? 'default' : 'outline'}
                                onClick={() => {
                                    updateData('isBreastfeeding', true);
                                    updateData('isPregnant', false);
                                }}
                                className="h-12 text-base"
                            >
                                Breastfeeding
                            </Button>
                            <Button
                                variant={data.isPregnant === false && data.isBreastfeeding === false ? 'default' : 'outline'}
                                onClick={() => {
                                    updateData('isPregnant', false);
                                    updateData('isBreastfeeding', false);
                                }}
                                className="h-12 text-base"
                            >
                                No
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    updateData('isPregnant', undefined);
                                    updateData('isBreastfeeding', undefined);
                                }}
                                className="h-12 text-base"
                            >
                                Prefer not to say
                            </Button>
                        </div>
                    </div>
                );

            case 5: // Location
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">Enter your area PIN code</h3>
                            <p className="text-muted-foreground">This helps us track regional safety patterns</p>
                        </div>

                        <div className="max-w-sm mx-auto">
                            <Input
                                type="text"
                                placeholder="Enter 6-digit PIN code"
                                value={data.pinCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    updateData('pinCode', value);
                                }}
                                className="h-12 text-center text-lg"
                                maxLength={6}
                            />
                        </div>
                    </div>
                );

            case 6: // Allergies
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">Allergy Information</h3>
                        </div>

                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="space-y-4">
                                <h4 className="font-medium">Do you have any medicine allergies?</h4>
                                <div className="grid gap-2">
                                    <Button
                                        variant={data.drugAllergies === true ? 'default' : 'outline'}
                                        onClick={() => updateData('drugAllergies', true)}
                                        className="h-10"
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant={data.drugAllergies === false ? 'default' : 'outline'}
                                        onClick={() => updateData('drugAllergies', false)}
                                        className="h-10"
                                    >
                                        No
                                    </Button>
                                </div>

                                {data.drugAllergies && (
                                    <Textarea
                                        placeholder="Which medicine caused allergy earlier?"
                                        value={data.allergyDetails}
                                        onChange={(e) => updateData('allergyDetails', e.target.value)}
                                        rows={3}
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium">Any food or other allergies?</h4>
                                <div className="grid gap-2">
                                    <Button
                                        variant={data.foodAllergies === true ? 'default' : 'outline'}
                                        onClick={() => updateData('foodAllergies', true)}
                                        className="h-10"
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant={data.foodAllergies === false ? 'default' : 'outline'}
                                        onClick={() => updateData('foodAllergies', false)}
                                        className="h-10"
                                    >
                                        No
                                    </Button>
                                </div>

                                {data.foodAllergies && (
                                    <Textarea
                                        placeholder="Please describe your food/other allergies"
                                        value={data.foodAllergyDetails}
                                        onChange={(e) => updateData('foodAllergyDetails', e.target.value)}
                                        rows={3}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 7: // Medical History
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">Medical History</h3>
                        </div>

                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="space-y-4">
                                <h4 className="font-medium">Do you have any long-term illness?</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Diabetes', 'Blood Pressure', 'Asthma', 'Kidney problem', 'Liver problem', 'Heart disease'].map((condition) => (
                                        <div key={condition} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={condition}
                                                checked={data.medicalConditions.includes(condition)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        updateData('medicalConditions', [...data.medicalConditions, condition]);
                                                    } else {
                                                        updateData('medicalConditions', data.medicalConditions.filter(c => c !== condition));
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
                                    value={data.abhaId}
                                    onChange={(e) => updateData('abhaId', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ayushman Bharat Health Account for better healthcare coordination
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium">Are you taking any other medicines right now?</h4>
                                <div className="grid gap-2">
                                    <Button
                                        variant={data.currentMedicines === true ? 'default' : 'outline'}
                                        onClick={() => updateData('currentMedicines', true)}
                                        className="h-10"
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant={data.currentMedicines === false ? 'default' : 'outline'}
                                        onClick={() => updateData('currentMedicines', false)}
                                        className="h-10"
                                    >
                                        No
                                    </Button>
                                </div>

                                {data.currentMedicines && (
                                    <Textarea
                                        placeholder="Please tell the names (or describe the medicines)"
                                        value={data.currentMedicineDetails}
                                        onChange={(e) => updateData('currentMedicineDetails', e.target.value)}
                                        rows={3}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-primary rounded-lg p-3">
                            {getStepIcon()}
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Profile Setup</CardTitle>
                            <p className="text-muted-foreground">{getStepTitle()}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Progress value={(currentStep + 1) / totalSteps * 100} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                            Step {currentStep + 1} of {totalSteps}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {renderStep()}

                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        {currentStep === totalSteps - 1 ? (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed()}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Complete Setup
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
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileSetup;