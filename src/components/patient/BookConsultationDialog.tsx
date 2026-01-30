import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Video, Phone } from 'lucide-react';

interface BookConsultationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    caseId?: string;
    caseName?: string;
}

const BookConsultationDialog = ({ isOpen, onClose, caseId, caseName }: BookConsultationDialogProps) => {
    const [consultationType, setConsultationType] = useState<'video' | 'phone'>('video');
    const [reason, setReason] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    const consultationReasons = [
        'Need clarification on doctor\'s verdict',
        'Experiencing new symptoms',
        'Side effects worsening',
        'Questions about prescribed medication',
        'Follow-up after treatment',
        'General health concern',
        'Other'
    ];

    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
    ];

    const handleSubmit = () => {
        if (!reason || !selectedDate || !selectedTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        // TODO: Send consultation request to backend
        toast.success('Consultation request submitted! You will receive a confirmation shortly.');
        onClose();

        // Reset form
        setReason('');
        setSelectedDate(new Date());
        setSelectedTime('');
        setAdditionalNotes('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Book a Consultation</DialogTitle>
                    <DialogDescription>
                        {caseId ? (
                            <>Request a follow-up consultation for case <span className="font-mono font-semibold">{caseName || caseId}</span></>
                        ) : (
                            'Schedule a consultation with a healthcare professional'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Consultation Type */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Consultation Type</Label>
                        <RadioGroup value={consultationType} onValueChange={(value: any) => setConsultationType(value)}>
                            <div className="flex gap-4">
                                <div className="flex items-center space-x-2 flex-1 border rounded-lg p-4 cursor-pointer hover:bg-accent" onClick={() => setConsultationType('video')}>
                                    <RadioGroupItem value="video" id="video" />
                                    <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Video className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Video Call</p>
                                            <p className="text-xs text-muted-foreground">Face-to-face consultation</p>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 flex-1 border rounded-lg p-4 cursor-pointer hover:bg-accent" onClick={() => setConsultationType('phone')}>
                                    <RadioGroupItem value="phone" id="phone" />
                                    <Label htmlFor="phone" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Phone className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Phone Call</p>
                                            <p className="text-xs text-muted-foreground">Voice consultation</p>
                                        </div>
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Reason for Consultation */}
                    <div className="space-y-3">
                        <Label htmlFor="reason" className="text-base font-semibold">Reason for Consultation *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {consultationReasons.map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Preferred Date *
                        </Label>
                        <div className="border rounded-lg p-4 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                                className="rounded-md"
                            />
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-3">
                        <Label htmlFor="time" className="text-base font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Preferred Time *
                        </Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger id="time">
                                <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {timeSlots.map((slot) => (
                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-3">
                        <Label htmlFor="notes" className="text-base font-semibold">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any specific concerns or questions you'd like to discuss..."
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookConsultationDialog;
