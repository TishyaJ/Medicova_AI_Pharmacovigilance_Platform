import { useState, useEffect } from 'react';
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
import { casesAPI } from '@/lib/api';
import { toast } from 'sonner';

interface CaseData {
    id: string | number;
    caseNumber: string;
    date: string;
    medicine: string;
    symptom: string;
    status: string;
    riskLevel: number;
    doctorVerdict?: string;
    lastUpdate?: string;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'doctor' | 'system' | 'patient';
    message: string;
    timestamp: string;
    type?: 'text' | 'image' | 'file';
}

interface CaseDetailSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: CaseData | null;
}

const CaseDetailSlideOver = ({ isOpen, onClose, caseData }: CaseDetailSlideOverProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch real case messages when component opens
    useEffect(() => {
        if (isOpen && caseData?.id) {
            loadCaseMessages();
        }
    }, [isOpen, caseData?.id]);

    const loadCaseMessages = async () => {
        if (!caseData?.id) return;
        setLoading(true);
        try {
            const messages = await casesAPI.getCaseMessages(caseData.id);

            // Transform backend messages to UI format
            const formattedMessages: ChatMessage[] = messages.map((msg: any) => ({
                id: msg.id.toString(),
                sender: msg.sender_role === 'patient' ? 'user' :
                    msg.sender_role === 'doctor' ? 'doctor' : 'system',
                message: msg.content,
                timestamp: new Date(msg.timestamp).toLocaleString(),
                type: 'text'
            }));

            setChatHistory(formattedMessages);
        } catch (error) {
            console.error('Failed to load case messages:', error);
            toast.error('Failed to load case messages');
        } finally {
            setLoading(false);
        }
    };

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

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Phone className="h-4 w-4" />
                                Call Doctor
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Video className="h-4 w-4" />
                                Video Call
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Upload className="h-4 w-4" />
                                Upload Evidence
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Calendar className="h-4 w-4" />
                                Book Follow-up
                            </Button>
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

                    <ScrollArea className="h-[300px] p-4">
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
            </SheetContent>
        </Sheet>
    );
};

export default CaseDetailSlideOver;