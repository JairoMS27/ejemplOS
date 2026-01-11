"use client"

import { useState } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { RefreshCw, Monitor, DoorOpen, Gamepad2 } from "lucide-react"
import { DesktopIcon } from "./desktop-icon"

interface DesktopProps {
  onOpenGamesFolder?: () => void
  onOpenApp?: (appType: "browser" | "paint", url?: string) => void
}

export function Desktop({ onOpenGamesFolder, onOpenApp }: DesktopProps) {
  const [iconPositions, setIconPositions] = useState({
    portfolio: { x: 50, y: 50 },
    twitter: { x: 50, y: 160 },
    games: { x: 50, y: 270 },
  })

  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)

  const handleRefresh = () => {
    window.location.reload()
  }

  const handlePortfolioClick = () => {
    onOpenApp?.("browser", "https://jairoms.is-a.dev")
  }

  const handleTwitterClick = () => {
    window.location.href = "https://twitter.com/ej3mplo"
  }

  const updateIconPosition = (icon: "portfolio" | "twitter" | "games", position: { x: number; y: number }) => {
    setIconPositions((prev) => ({
      ...prev,
      [icon]: position,
    }))
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="w-full h-full flex flex-col items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setSelectedIcon(null)
        }}
      >
        {/* Desktop icons */}
        <DesktopIcon
          icon={DoorOpen}
          label="Portfolio"
          onDoubleClick={handlePortfolioClick}
          initialPosition={iconPositions.portfolio}
          onPositionChange={(pos) => updateIconPosition("portfolio", pos)}
          selected={selectedIcon === "portfolio"}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedIcon("portfolio")
          }}
        />

        <DesktopIcon
          icon={({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          )}
          label="X"
          onDoubleClick={handleTwitterClick}
          initialPosition={iconPositions.twitter}
          onPositionChange={(pos) => updateIconPosition("twitter", pos)}
          selected={selectedIcon === "twitter"}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedIcon("twitter")
          }}
        />

        <DesktopIcon
          icon={Gamepad2}
          label="Juegos"
          onDoubleClick={onOpenGamesFolder}
          initialPosition={iconPositions.games}
          onPositionChange={(pos) => updateIconPosition("games", pos)}
          selected={selectedIcon === "games"}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedIcon("games")
          }}
        />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-black border-white/20 text-white">
        <ContextMenuItem onClick={handleRefresh} className="focus:bg-white/10 cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Actualizar</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/20" />
        <ContextMenuItem disabled className="opacity-50">
          <Monitor className="mr-2 h-4 w-4" />
          <span>Configuración de pantalla</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
