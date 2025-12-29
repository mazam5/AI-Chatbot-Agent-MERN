import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { Kbd } from "./ui/kbd"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex w-full h-screen">
                <AppSidebar />

                <main className="relative flex-1 overflow-hidden">
                    <div className="absolute top-0 left-0">
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

                    <div className="w-full h-full">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}