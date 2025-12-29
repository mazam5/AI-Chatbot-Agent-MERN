import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useTheme } from "@/components/providers/theme-provider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"

export function ToggleTheme() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  // Keyboard shortcut: M
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "~" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault()
        setTheme(isDark ? "light" : "dark")
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isDark, setTheme])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          variant="outline"
          size="lg"
          pressed={isDark}
          onPressedChange={(pressed) =>
            setTheme(pressed ? "dark" : "light")
          }
          aria-label="Toggle theme"
          className="relative"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Toggle>
      </TooltipTrigger>

      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>Toggle theme</span>
        <Kbd>~</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
