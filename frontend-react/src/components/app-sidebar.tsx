import { Clock, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar";
import { chatAPI } from "@/services/chatApi";
import { Button } from "./ui/button";
import type { ChatSession } from "@/types";

interface AppSidebarProps {
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string) => void;
    key?: string | number;
}

export function AppSidebar({
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    key
}: AppSidebarProps) {
    const { state, toggleSidebar } = useSidebar();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Load chat sessions from API
    useEffect(() => {
        loadSessions();
    }, [key]); // Reload when key changes (refreshTrigger)

    const loadSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await chatAPI.getSessions();

            setSessions(
                data.sort(
                    (a: ChatSession, b: ChatSession) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
            );
        } catch (error) {
            console.error('Failed to load sessions:', error);
            setError('Failed to load chat history');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (confirm('Are you sure you want to delete this chat?')) {
            try {
                await chatAPI.deleteSession(sessionId);

                // Update UI immediately
                setSessions(prev => prev.filter(s => s.id !== sessionId));

                // Notify parent component
                onDeleteSession(sessionId);

                // Reload sessions to ensure consistency
                await loadSessions();
            } catch (error) {
                console.error('Failed to delete session:', error);
                alert('Failed to delete chat. Please try again.');
            }
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
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onNewChat}
                            className="text-xs rounded hover:bg-accent hover:text-accent-foreground"
                            title="New Chat"
                        >
                            <Plus className="h-4 w-4" /> New Chat
                        </Button>
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="flex-1 overflow-y-auto my-4">
                        <SidebarMenu>
                            {loading ? (
                                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                    Loading conversations...
                                </div>
                            ) : error ? (
                                <div className="px-4 py-8 text-center text-destructive text-sm">
                                    {error}
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                    No conversations yet
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <SidebarMenuItem key={session.id} className="gap-3">
                                        <div className="relative group w-full">
                                            <SidebarMenuButton
                                                className="w-full h-full pr-10"
                                                onClick={() => onSelectSession(session.id)}
                                                isActive={currentSessionId === session.id}
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                <div className="flex-1 overflow-hidden text-left">
                                                    <div className="font-medium truncate">
                                                        {session.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {session.lastMessage}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTimestamp(new Date(session.timestamp))}
                                                        <span>• {session.messageCount} msgs</span>
                                                    </div>
                                                </div>
                                            </SidebarMenuButton>
                                            <div
                                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                                            >
                                                <Button
                                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                                    className="p-1.5 hover:bg-destructive/10 rounded transition-colors pointer-events-auto"
                                                    title="Delete chat"
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
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