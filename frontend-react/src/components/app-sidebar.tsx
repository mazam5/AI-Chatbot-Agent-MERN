import { useEffect } from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    useSidebar
} from "@/components/ui/sidebar";


export function AppSidebar() {
    const {
        state,
        toggleSidebar,
    } = useSidebar();
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key.toLowerCase() === "`" &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.altKey
            ) {
                e.preventDefault()
                toggleSidebar()
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [state, toggleSidebar])
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Chats History</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}