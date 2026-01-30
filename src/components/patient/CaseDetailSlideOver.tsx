import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    User,
    Bot,
    Send,
    FileText,
    Phone,
    Video,
    Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseData {
    id: string;
    caseNumber: string;
    date: string;
    medicine: string;
    symptom: string;
    status: 'pending' | 'reviewed' | 'closed' | 'urgent';
    riskLevel: 1 | 2 | 3 | 4 | 5;
    doctorVerdict?: string;
    lastUpdate: string;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'doctor' | 'system';
    message: string;
    timestamp: string;
    type?: 'text' | 'image' | 'file';
}

interface CaseDetailSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: CaseData | null;
}

// Mock chat history for the case
const mockChatHistory: ChatMessage[] = [
    {
        id: '1',
        sender: 'system',
        message: 'Case opened. Patient reported side effects.',
        timestamp: '2025-01-28 10:30 AM',
        type: 'text'
    },
    {
        id: '2',
        sender: 'user',
        message: 'I started taking Dolo-650 yesterday and developed a red rash on my arms and chest. It\'s itchy and spreading.',
        timestamp: '2025-01-28 10:32 AM',
        type: 'text'
    },
    {
        id: '3',
        sender: 'user',
        message: 'Here\'s a photo of the rash',
        timestamp: '2025-01-28 10:33 AM',
        type: 'image'
    },
    {
        id: '4',
        sender: 'system',
        message: 'Case escalated to Risk Level 3. Doctor notification sent.',
        timestamp: '2025-01-28 11:00 AM',
        type: 'text'
    },
    {
        id: '5',
        sender: 'doctor',
        message: 'Hello, I\'m Dr. Sharma. I\'ve reviewed your case. The rash appears to be an allergic reaction to paracetamol. Please stop taking Dolo-650 immediately.',
        timestamp: '2025-01-28 2:15 PM',
        type: 'text'
    },
    {
        id: '6',
        sender: 'doctor',
        message: 'I\'m prescribing an antihistamine. Please take Cetirizine 10mg once daily for 3 days. The rash should subside.',
        timestamp: '2025-01-28 2:16 PM',
        type: 'text'
    },
    {
        id: '7',
        sender: 'user',
        message: 'Thank you doctor. Should I be concerned about taking other paracetamol-based medicines?',
        timestamp: '2025-01-28 3:45 PM',
        type: 'text'
    },
    {
        id: '8',
        sender: 'doctor',
        message: 'Yes, please avoid all paracetamol-containing medications. I\'ll update your allergy profile. For fever, you can use ibuprofen instead.',
        timestamp: '2025-01-28 4:20 PM',
        type: 'text'
    }
];

const CaseDetailSlideOver = ({ isOpen, onClose, caseData }: CaseDetailSlideOverProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);

    if (!caseData) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'closed': return 'bg-green-100 text-green-800 border-green-200';
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'reviewed': return <CheckCircle className="h-3 w-3" />;
            case 'closed': return <CheckCircle className="h-3 w-3" />;
            case 'urgent': return <AlertTriangle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const getRiskLevelColor = (level: number) => {
        if (level >= 4) return 'text-red-600 bg-red-50 border-red-200';
        if (level >= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (level >= 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getSenderIcon = (sender: string) => {
        switch (sender) {
            case 'user': return <User className="h-4 w-4" />;
            case 'doctor': return <User className="h-4 w-4 text-blue-600" />;
            case 'system': return <Bot className="h-4 w-4 text-gray-500" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            message: newMessage,
            timestamp: new Date().toLocaleString(),
            type: 'text'
        };

        setChatHistory(prev => [...prev, message]);
        setNewMessage('');
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                {/* Header */}
                <SheetHeader className="p-6 pb-4 border-b bg-slate-50 dark:bg-slate-900">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-lg font-semibold">
                                Case Details
                            </SheetTitle>
                            <div className="text-sm font-mono text-muted-foreground">
                                {caseData.caseNumber}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className={cn("text-xs", getStatusColor(caseData.status))}
                            >
                                {getStatusIcon(caseData.status)}
                                <span className="ml-1 capitalize">{caseData.status}</span>
                            </Badge>
                            <Badge
                                variant="outline"
                                className={cn("text-xs border", getRiskLevelColor(caseData.riskLevel))}
                            >
                                Risk Level {caseData.riskLevel}
                            </Badge>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                            <h4 className="font-semibold text-base mb-2">{caseData.symptom}</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Medicine:</span>
                                    <p className="font-medium">{caseData.medicine}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Date Reported:</span>
                                    <p className="font-medium">{new Date(caseData.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                {/* Chat History */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Communication History
                        </h4>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {chatHistory.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3",
                                        msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                        msg.sender === 'user' ? "bg-blue-100 text-blue-600" :
                                            msg.sender === 'doctor' ? "bg-green-100 text-green-600" :
                                                "bg-gray-100 text-gray-600"
                                    )}>
                                        {getSenderIcon(msg.sender)}
                                    </div>

                                    <div className={cn(
                                        "flex-1 max-w-[80%]",
                                        msg.sender === 'user' ? "text-right" : "text-left"
                                    )}>
                                        <div className={cn(
                                            "inline-block p-3 rounded-lg text-sm",
                                            msg.sender === 'user'
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : msg.sender === 'doctor'
                                                    ? "bg-green-50 text-green-900 border border-green-200 rounded-tl-none"
                                                    : "bg-gray-50 text-gray-900 border border-gray-200 rounded-tl-none"
                                        )}>
                                            {msg.type === 'image' ? (
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="italic">{msg.message}</span>
                                                </div>
                                            ) : (
                                                <p>{msg.message}</p>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {msg.sender === 'doctor' && <span className="font-medium">Dr. Sharma • </span>}
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Message Input */}
                    {caseData.status !== 'closed' && (
                        <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
                            <div className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Call Doctor
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Call
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Evidence
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Book Follow-up
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CaseDetailSlideOver;