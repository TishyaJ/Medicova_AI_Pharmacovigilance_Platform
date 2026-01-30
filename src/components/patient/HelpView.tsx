import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Phone,
    MessageCircle,
    Mail,
    HelpCircle,
    AlertTriangle,
    Clock,
    MapPin,
    ExternalLink
} from 'lucide-react';

const HelpView = () => {
    const emergencyContacts = [
        {
            name: 'National Emergency',
            number: '102',
            description: 'Ambulance & Medical Emergency',
            available: '24/7'
        },
        {
            name: 'Poison Control',
            number: '1066',
            description: 'Poison Information & Emergency',
            available: '24/7'
        },
        {
            name: 'Police Emergency',
            number: '100',
            description: 'Police Emergency Services',
            available: '24/7'
        },
        {
            name: 'Fire Emergency',
            number: '101',
            description: 'Fire & Rescue Services',
            available: '24/7'
        }
    ];

    const supportOptions = [
        {
            title: 'Live Chat Support',
            description: 'Chat with our support team for immediate assistance',
            icon: MessageCircle,
            action: 'Start Chat',
            available: 'Mon-Fri, 9 AM - 6 PM'
        },
        {
            title: 'Email Support',
            description: 'Send us an email and we\'ll respond within 24 hours',
            icon: Mail,
            action: 'Send Email',
            available: 'support@medicova.com'
        },
        {
            title: 'Phone Support',
            description: 'Call our helpline for urgent queries',
            icon: Phone,
            action: 'Call Now',
            available: '+91 1800-123-4567'
        }
    ];

    const faqs = [
        {
            question: 'How do I report a side effect?',
            answer: 'Click on "Register New Case" from your dashboard and follow the step-by-step wizard to report any adverse reactions.'
        },
        {
            question: 'How long does it take for a doctor to review my case?',
            answer: 'Most cases are reviewed within 24-48 hours. Urgent cases marked as high-risk are prioritized and reviewed within 2-4 hours.'
        },
        {
            question: 'Can I upload photos of my symptoms?',
            answer: 'Yes, you can upload photos during the case registration process or add them later through the case conversation.'
        },
        {
            question: 'Is my medical information secure?',
            answer: 'Yes, all your medical data is encrypted and stored securely. We follow strict privacy guidelines and never share your information without consent.'
        },
        {
            question: 'What should I do in case of a medical emergency?',
            answer: 'For medical emergencies, call 102 immediately. You can also use the Emergency button in the app header for quick access.'
        }
    ];

    const nearbyHospitals = [
        {
            name: 'Apollo Hospital',
            address: 'Sarita Vihar, New Delhi',
            distance: '2.3 km',
            phone: '+91 11 2692 5858',
            emergency: true
        },
        {
            name: 'Max Super Speciality Hospital',
            address: 'Saket, New Delhi',
            distance: '3.1 km',
            phone: '+91 11 2651 5050',
            emergency: true
        },
        {
            name: 'Fortis Hospital',
            address: 'Vasant Kunj, New Delhi',
            distance: '4.2 km',
            phone: '+91 11 4277 6222',
            emergency: true
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Get Help & Support</h1>
                <p className="text-muted-foreground">
                    Emergency contacts, support options, and frequently asked questions.
                </p>
            </div>

            {/* Emergency Contacts */}
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Emergency Contacts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {emergencyContacts.map((contact) => (
                            <div key={contact.number} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border">
                                <div>
                                    <h4 className="font-semibold">{contact.name}</h4>
                                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                                    <Badge variant="outline" className="mt-1 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {contact.available}
                                    </Badge>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => window.open(`tel:${contact.number}`)}
                                    className="flex items-center gap-2"
                                >
                                    <Phone className="h-4 w-4" />
                                    {contact.number}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Support Options */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Support Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {supportOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <div key={option.title} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{option.title}</h4>
                                                <p className="text-sm text-muted-foreground">{option.description}</p>
                                                <p className="text-xs text-primary mt-1">{option.available}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            {option.action}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Nearby Hospitals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Nearby Hospitals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {nearbyHospitals.map((hospital) => (
                                <div key={hospital.name} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">{hospital.name}</h4>
                                        {hospital.emergency && (
                                            <Badge variant="destructive" className="text-xs">
                                                24/7 Emergency
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{hospital.address}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{hospital.distance} away</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`tel:${hospital.phone}`)}
                                        >
                                            <Phone className="h-3 w-3 mr-1" />
                                            Call
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b pb-4 last:border-b-0">
                                <h4 className="font-semibold mb-2">{faq.question}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Resources */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="justify-start h-12">
                            <ExternalLink className="h-4 w-4 mr-3" />
                            User Guide & Tutorials
                        </Button>
                        <Button variant="outline" className="justify-start h-12">
                            <ExternalLink className="h-4 w-4 mr-3" />
                            Medicine Safety Guidelines
                        </Button>
                        <Button variant="outline" className="justify-start h-12">
                            <ExternalLink className="h-4 w-4 mr-3" />
                            Privacy Policy
                        </Button>
                        <Button variant="outline" className="justify-start h-12">
                            <ExternalLink className="h-4 w-4 mr-3" />
                            Terms of Service
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HelpView;