import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    ArrowRight,
    Upload,
    Camera,
    AlertTriangle,
    CheckCircle,
    Phone,
    Languages,
    User,
    Pill,
    Activity,
    FileText,
    Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CaseWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (caseData: any) => void;
}

interface WizardData {
    // Step 0: Consent & Language
    consent: boolean;
    language: string;

    // Phase 1: Basic Profile (if new user)
    age: string;
    gender: string;
    isPregnant?: boolean;
    pinCode: string;

    // Phase 2: Medical History (if new user)
    medicalHistory: string[];
    abhaId: string;

    // Phase 3: Medicine Details
    medicineName: string;
    dosage: string;
    duration: string;
    prescriber: string;

    // Phase 4: Side Effect Reporting
    symptoms: string[];
    severity: 'mild' | 'moderate' | 'severe' | 'emergency';
    additionalSymptoms: string;

    // Phase 5: Evidence
    uploadedFiles: File[];

    // Phase 6: Summary
    additionalNotes: string;
}

const initialData: WizardData = {
    consent: false,
    language: '',
    age: '',
    gender: '',
    pinCode: '',
    medicalHistory: [],
    abhaId: '',
    medicineName: '',
    dosage: '',
    duration: '',
    prescriber: '',
    symptoms: [],
    severity: 'mild',
    additionalSymptoms: '',
    uploadedFiles: [],
    additionalNotes: ''
};

const CaseWizard = ({ isOpen, onClose, onSubmit }: CaseWizardProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<WizardData>(initialData);
    const [isProfileComplete] = useState(false); // Mock - would come from user context

    // Calculate total steps based on profile completion
    const totalSteps = isProfileComplete ? 5 : 7; // Skip profile steps if complete
    const stepOffset = isProfileComplete ? 2 : 0; // Offset for step calculation

    const updateData = (field: keyof WizardData, value: any) => {
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

    const handleSubmit = () => {
        // Validate required fields
        if (!data.consent || !data.medicineName || !data.symptoms.length) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (data.severity === 'emergency') {
            // Show emergency dialog
            const shouldCall = window.confirm('This is marked as EMERGENCY. Would you like to call 102 (Ambulance) now?');
            if (shouldCall) {
                window.open('tel:102');
            }
        }

        // Format data for API
        const caseData = {
            medicine: data.medicineName,
            symptoms: `${data.symptoms.join(', ')}${data.additionalSymptoms ? '. ' + data.additionalSymptoms : ''}`,
            severity: data.severity,
            dosage: data.dosage,
            duration: data.duration,
            prescriber: data.prescriber,
            additionalNotes: data.additionalNotes
        };

        onSubmit(caseData);
        onClose();
        setCurrentStep(0);
        setData(initialData);
    };

    const getStepTitle = (step: number) => {
        const adjustedStep = step + stepOffset;
        switch (adjustedStep) {
            case 0: return 'Consent & Language';
            case 1: return 'Basic Profile';
            case 2: return 'Medical History';
            case 3: return 'Medicine Details';
            case 4: return 'Side Effect Reporting';
            case 5: return 'Evidence Upload';
            case 6: return 'Review & Submit';
            default: return 'Step';
        }
    };

    const getStepIcon = (step: number) => {
        const adjustedStep = step + stepOffset;
        switch (adjustedStep) {
            case 0: return <Languages className="h-4 w-4" />;
            case 1: return <User className="h-4 w-4" />;
            case 2: return <Activity className="h-4 w-4" />;
            case 3: return <Pill className="h-4 w-4" />;
            case 4: return <AlertTriangle className="h-4 w-4" />;
            case 5: return <Upload className="h-4 w-4" />;
            case 6: return <FileText className="h-4 w-4" />;
            default: return <CheckCircle className="h-4 w-4" />;
        }
    };

    const renderStep = () => {
        const adjustedStep = currentStep + stepOffset;

        switch (adjustedStep) {
            case 0: // Consent & Language
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Languages className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Welcome to Medicova</h3>
                            <p className="text-muted-foreground">
                                We'll help you report side effects safely and connect with healthcare professionals.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="language">Preferred Language</Label>
                                <Select value={data.language} onValueChange={(value) => updateData('language', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                                        <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                                        <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="consent"
                                    checked={data.consent}
                                    onCheckedChange={(checked) => updateData('consent', checked)}
                                />
                                <Label htmlFor="consent" className="text-sm leading-relaxed">
                                    I consent to sharing my medical information with healthcare professionals for the purpose of adverse event reporting and treatment guidance. I understand this data will be used to improve drug safety.
                                </Label>
                            </div>
                        </div>
                    </div>
                );

            case 1: // Basic Profile (if new user)
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                            <p className="text-muted-foreground">
                                Help us understand your profile for better care.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    placeholder="Enter age"
                                    value={data.age}
                                    onChange={(e) => updateData('age', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="pincode">PIN Code</Label>
                                <Input
                                    id="pincode"
                                    placeholder="Enter PIN code"
                                    value={data.pinCode}
                                    onChange={(e) => updateData('pinCode', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Gender</Label>
                            <RadioGroup
                                value={data.gender}
                                onValueChange={(value) => updateData('gender', value)}
                                className="flex gap-6 mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female">Female</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {data.gender === 'female' && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pregnant"
                                    checked={data.isPregnant}
                                    onCheckedChange={(checked) => updateData('isPregnant', checked)}
                                />
                                <Label htmlFor="pregnant">I am currently pregnant</Label>
                            </div>
                        )}
                    </div>
                );

            case 2: // Medical History (if new user)
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Activity className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Medical History</h3>
                            <p className="text-muted-foreground">
                                Select any conditions that apply to you.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {['Diabetes', 'High Blood Pressure', 'Asthma', 'Heart Disease', 'Kidney Disease', 'Liver Disease'].map((condition) => (
                                <div key={condition} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={condition}
                                        checked={data.medicalHistory.includes(condition)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                updateData('medicalHistory', [...data.medicalHistory, condition]);
                                            } else {
                                                updateData('medicalHistory', data.medicalHistory.filter(c => c !== condition));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={condition}>{condition}</Label>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label htmlFor="abha">ABHA ID (Optional)</Label>
                            <Input
                                id="abha"
                                placeholder="Enter your ABHA ID"
                                value={data.abhaId}
                                onChange={(e) => updateData('abhaId', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Ayushman Bharat Health Account for better healthcare coordination
                            </p>
                        </div>
                    </div>
                );

            case 3: // Medicine Details
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Pill className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Medicine Information</h3>
                            <p className="text-muted-foreground">
                                Tell us about the medicine that caused the side effect.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="medicine">Medicine Name *</Label>
                                <Input
                                    id="medicine"
                                    placeholder="e.g., Dolo-650, Paracetamol"
                                    value={data.medicineName}
                                    onChange={(e) => updateData('medicineName', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dosage">Dosage</Label>
                                    <Input
                                        id="dosage"
                                        placeholder="e.g., 650mg"
                                        value={data.dosage}
                                        onChange={(e) => updateData('dosage', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        placeholder="e.g., 3 days"
                                        value={data.duration}
                                        onChange={(e) => updateData('duration', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Prescribed by</Label>
                                <RadioGroup
                                    value={data.prescriber}
                                    onValueChange={(value) => updateData('prescriber', value)}
                                    className="flex gap-6 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="doctor" id="doctor" />
                                        <Label htmlFor="doctor">Doctor</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="pharmacist" id="pharmacist" />
                                        <Label htmlFor="pharmacist">Pharmacist</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="self" id="self" />
                                        <Label htmlFor="self">Self-medication</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                );

            case 4: // Side Effect Reporting
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Side Effect Details</h3>
                            <p className="text-muted-foreground">
                                Describe the symptoms you experienced.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Common Symptoms (Select all that apply)</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {[
                                        'Skin Rash', 'Nausea', 'Vomiting', 'Diarrhea',
                                        'Headache', 'Dizziness', 'Breathing Difficulty', 'Chest Pain',
                                        'Swelling', 'Fever', 'Fatigue', 'Other'
                                    ].map((symptom) => (
                                        <div key={symptom} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={symptom}
                                                checked={data.symptoms.includes(symptom)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        updateData('symptoms', [...data.symptoms, symptom]);
                                                    } else {
                                                        updateData('symptoms', data.symptoms.filter(s => s !== symptom));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Severity Level</Label>
                                <RadioGroup
                                    value={data.severity}
                                    onValueChange={(value: any) => updateData('severity', value)}
                                    className="grid grid-cols-2 gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <RadioGroupItem value="mild" id="mild" />
                                        <Label htmlFor="mild" className="flex-1">
                                            <div className="font-medium text-green-600">Mild</div>
                                            <div className="text-xs text-muted-foreground">Manageable discomfort</div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <RadioGroupItem value="moderate" id="moderate" />
                                        <Label htmlFor="moderate" className="flex-1">
                                            <div className="font-medium text-yellow-600">Moderate</div>
                                            <div className="text-xs text-muted-foreground">Noticeable symptoms</div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <RadioGroupItem value="severe" id="severe" />
                                        <Label htmlFor="severe" className="flex-1">
                                            <div className="font-medium text-orange-600">Severe</div>
                                            <div className="text-xs text-muted-foreground">Significant impact</div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg border-red-200 bg-red-50">
                                        <RadioGroupItem value="emergency" id="emergency" />
                                        <Label htmlFor="emergency" className="flex-1">
                                            <div className="font-medium text-red-600">Emergency</div>
                                            <div className="text-xs text-red-500">Life-threatening</div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {data.severity === 'emergency' && (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-800 mb-2">
                                        <Phone className="h-4 w-4" />
                                        <span className="font-semibold">Emergency Alert</span>
                                    </div>
                                    <p className="text-sm text-red-700 mb-3">
                                        You've marked this as an emergency. Would you like to call for immediate help?
                                    </p>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => window.open('tel:102')}
                                    >
                                        Call 102 (Ambulance)
                                    </Button>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="additional">Additional Details</Label>
                                <Textarea
                                    id="additional"
                                    placeholder="Describe your symptoms in detail..."
                                    value={data.additionalSymptoms}
                                    onChange={(e) => updateData('additionalSymptoms', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 5: // Evidence Upload
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Upload Evidence</h3>
                            <p className="text-muted-foreground">
                                Add photos or documents to support your report (optional).
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                <div className="space-y-4">
                                    <div className="flex justify-center gap-4">
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Camera className="h-4 w-4" />
                                            Take Photo
                                        </Button>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            Upload File
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Supported formats: JPG, PNG, PDF (Max 10MB)
                                    </p>
                                </div>
                            </div>

                            {data.uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Uploaded Files</Label>
                                    {data.uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <span className="text-sm">{file.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newFiles = data.uploadedFiles.filter((_, i) => i !== index);
                                                    updateData('uploadedFiles', newFiles);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 6: // Review & Submit
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                            <h3 className="text-lg font-semibold mb-2">Review Your Report</h3>
                            <p className="text-muted-foreground">
                                Please review your information before submitting.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                <div>
                                    <span className="font-medium">Medicine:</span> {data.medicineName}
                                </div>
                                <div>
                                    <span className="font-medium">Symptoms:</span> {data.symptoms.join(', ')}
                                </div>
                                <div>
                                    <span className="font-medium">Severity:</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "ml-2",
                                            data.severity === 'emergency' && "border-red-500 text-red-700",
                                            data.severity === 'severe' && "border-orange-500 text-orange-700",
                                            data.severity === 'moderate' && "border-yellow-500 text-yellow-700",
                                            data.severity === 'mild' && "border-green-500 text-green-700"
                                        )}
                                    >
                                        {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)}
                                    </Badge>
                                </div>
                                {data.dosage && (
                                    <div>
                                        <span className="font-medium">Dosage:</span> {data.dosage}
                                    </div>
                                )}
                                {data.duration && (
                                    <div>
                                        <span className="font-medium">Duration:</span> {data.duration}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Any additional information you'd like to share..."
                                    value={data.additionalNotes}
                                    onChange={(e) => updateData('additionalNotes', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const canProceed = () => {
        const adjustedStep = currentStep + stepOffset;
        switch (adjustedStep) {
            case 0: return data.consent && data.language;
            case 1: return data.age && data.gender && data.pinCode;
            case 2: return true; // Medical history is optional
            case 3: return data.medicineName && data.prescriber;
            case 4: return data.symptoms.length > 0 && data.severity;
            case 5: return true; // Evidence is optional
            case 6: return true;
            default: return true;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        {getStepIcon(currentStep)}
                        {getStepTitle(currentStep)}
                    </DialogTitle>
                    <div className="space-y-2">
                        <Progress value={(currentStep + 1) / totalSteps * 100} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                            Step {currentStep + 1} of {totalSteps}
                        </p>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {renderStep()}
                </div>

                <div className="flex justify-between pt-4 border-t">
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
                            onClick={handleSubmit}
                            disabled={!canProceed()}
                            className="flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Submit Report
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
            </DialogContent>
        </Dialog>
    );
};

export default CaseWizard;