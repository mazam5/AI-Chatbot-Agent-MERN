import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Clock } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar
} from "@/components/ui/sidebar";

interface AppSidebarProps {
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string) => void;
}

export function AppSidebar({
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession
}: AppSidebarProps) {
    const { state, toggleSidebar } = useSidebar();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key.toLowerCase() === "`" &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.altKey
            ) {
                e.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [state, toggleSidebar]);

    // Load chat sessions from localStorage
    useEffect(() => {
        loadSessions();
    }, [currentSessionId]);

    const loadSessions = () => {
        try {
            const savedSessions = localStorage.getItem('chatSessions');
            if (savedSessions) {
                const parsed = JSON.parse(savedSessions);
                const sessionsWithDates = parsed.map((s: any) => ({
                    ...s,
                    timestamp: new Date(s.timestamp)
                }));
                setSessions(sessionsWithDates.sort((a: ChatSession, b: ChatSession) =>
                    b.timestamp.getTime() - a.timestamp.getTime()
                ));
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (confirm('Are you sure you want to delete this chat?')) {
            // Remove from localStorage
            const savedSessions = localStorage.getItem('chatSessions');
            if (savedSessions) {
                const parsed = JSON.parse(savedSessions);
                const filtered = parsed.filter((s: ChatSession) => s.id !== sessionId);
                localStorage.setItem('chatSessions', JSON.stringify(filtered));
            }

            // Remove messages for this session
            localStorage.removeItem(`chat_messages_${sessionId}`);

            // Update UI
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            onDeleteSession(sessionId);
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center justify-between px-2">
                        <span>Chat History</span>
                        <button
                            onClick={onNewChat}
                            className="text-xs px-2 py-1 rounded hover:bg-accent"
                            title="New Chat"
                        >
                            + New
                        </button>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {loading ? (
                                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                    Loading...
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                    No chat history yet
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <SidebarMenuItem key={session.id}>
                                        <SidebarMenuButton
                                            onClick={() => onSelectSession(session.id)}
                                            isActive={currentSessionId === session.id}
                                            className="group relative"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-medium truncate">
                                                    {session.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {session.lastMessage}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimestamp(session.timestamp)}
                                                    <span>• {session.messageCount} msgs</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteSession(session.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                                                title="Delete chat"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}