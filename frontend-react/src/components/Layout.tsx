import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Kbd } from './ui/kbd'

interface LayoutProps {
  children: React.ReactNode
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  refreshTrigger: number
}

export default function Layout({
  children,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  refreshTrigger,
}: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          currentSessionId={currentSessionId}
          onSelectSession={onSelectSession}
          onNewChat={onNewChat}
          onDeleteSession={onDeleteSession}
          refreshTrigger={refreshTrigger}
        />

        <main className="relative flex-1 overflow-hidden">
          <div className="absolute top-0 left-0 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger />
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>show/hide sidebar</span>
                <Kbd>`</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
