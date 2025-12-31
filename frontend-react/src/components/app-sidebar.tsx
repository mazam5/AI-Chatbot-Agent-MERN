import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { chatAPI } from '@/services/chatApi'
import type { ChatSession } from '@/types'
import { Clock, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
interface AppSidebarProps {
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  refreshTrigger?: number
}

export function AppSidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  refreshTrigger,
}: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === '`' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state, toggleSidebar])

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await chatAPI.getSessions()

      setSessions(
        data.sort(
          (a: ChatSession, b: ChatSession) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      )
    } catch (error) {
      console.error('Failed to load sessions:', error)
      setError('Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await chatAPI.deleteSession(sessionId)

        setSessions((prev) => prev.filter((s) => s.id !== sessionId))

        onDeleteSession(sessionId)

        await loadSessions()
      } catch (error) {
        console.error('Failed to delete session:', error)
        alert('Failed to delete chat. Please try again.')
      }
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

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
              className="hover:bg-accent hover:text-accent-foreground rounded text-xs"
              title="New Chat"
            >
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent className="my-4 flex-1 overflow-y-auto">
            <SidebarMenu>
              {loading ? (
                <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                  Loading conversations...
                </div>
              ) : error ? (
                <div className="text-destructive px-4 py-8 text-center text-sm">{error}</div>
              ) : sessions.length === 0 ? (
                <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                  No conversations yet
                </div>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem key={session.id} className="gap-3">
                    <div className="group relative w-full">
                      <SidebarMenuButton
                        className="h-full w-full pr-10"
                        onClick={() => onSelectSession(session.id)}
                        isActive={currentSessionId === session.id}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <div className="flex-1 overflow-hidden text-left">
                          <div className="truncate font-medium">{session.title}</div>
                          <div className="text-muted-foreground truncate text-xs">
                            {session.lastMessage}
                          </div>
                          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(new Date(session.timestamp))}
                            <span>• {session.messageCount} msgs</span>
                          </div>
                        </div>
                      </SidebarMenuButton>
                      <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                        <Button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="hover:bg-destructive/10 pointer-events-auto rounded p-1.5 transition-colors"
                          title="Delete chat"
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="text-destructive h-3.5 w-3.5" />
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
  )
}
