"use client"

import { useState, useEffect } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { RefreshCw, Monitor, DoorOpen, Gamepad2, Palette, Settings, FolderOpen, Music, Globe } from "lucide-react"
import { DesktopIcon } from "./desktop-icon"
import { useI18n } from "@/lib/i18n-context"

// Hook para detectar si estamos en móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

interface DesktopProps {
  onOpenGamesFolder?: () => void
  onOpenProjectsFolder?: () => void
  onOpenApp?: (appType: "browser" | "paint", url?: string) => void
  onOpenSettings?: () => void
  onOpenEjPod?: () => void
  onOpenBrowser?: () => void
}

export function Desktop({ onOpenGamesFolder, onOpenProjectsFolder, onOpenApp, onOpenSettings, onOpenEjPod, onOpenBrowser }: DesktopProps) {
  const isMobile = useIsMobile()
  const { t } = useI18n()
  const [iconPositions, setIconPositions] = useState({
    portfolio: { x: 50, y: 50 },
    twitter: { x: 50, y: 160 },
    games: { x: 50, y: 270 },
    projects: { x: 50, y: 380 },
    paint: { x: 50, y: 490 },
    settings: { x: 50, y: 600 },
    ejpod: { x: 50, y: 710 },
    browser: { x: 50, y: 820 },
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

  const updateIconPosition = (icon: "portfolio" | "twitter" | "games" | "projects" | "paint" | "settings" | "ejpod" | "browser", position: { x: number; y: number }) => {
    setIconPositions((prev) => ({
      ...prev,
      [icon]: position,
    }))
  }

  // Datos de los iconos para renderizar dinámicamente
  const desktopIcons = [
    {
      id: "portfolio",
      icon: DoorOpen,
      label: t.desktop.portfolio,
      onDoubleClick: handlePortfolioClick,
    },
    {
      id: "twitter",
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: "X",
      onDoubleClick: handleTwitterClick,
    },
    {
      id: "games",
      icon: Gamepad2,
      label: t.desktop.games,
      onDoubleClick: onOpenGamesFolder,
    },
    {
      id: "projects",
      icon: FolderOpen,
      label: t.desktop.myProjects,
      onDoubleClick: onOpenProjectsFolder,
    },
    {
      id: "paint",
      icon: Palette,
      label: t.desktop.paint,
      onDoubleClick: () => onOpenApp?.("paint"),
    },
    {
      id: "settings",
      icon: Settings,
      label: t.desktop.settings,
      onDoubleClick: onOpenSettings,
    },
    {
      id: "ejpod",
      icon: Music,
      label: t.desktop.ejpod,
      onDoubleClick: onOpenEjPod,
    },
    {
      id: "browser",
      icon: Globe,
      label: t.desktop.browser,
      onDoubleClick: onOpenBrowser,
    },
  ]

  return (
    <div className="absolute inset-0">
      <ContextMenu>
        <ContextMenuTrigger
          className="absolute inset-0"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedIcon(null)
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIcon(null)
          }}
        >
        {/* Mobile: Grid layout */}
        {isMobile ? (
          <div className="w-full h-full p-4 pt-16">
            <div className="grid grid-cols-4 gap-4">
              {desktopIcons.map((item) => (
                <DesktopIcon
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  onDoubleClick={item.onDoubleClick}
                  initialPosition={{ x: 0, y: 0 }}
                  onPositionChange={() => {}}
                  selected={selectedIcon === item.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIcon(item.id)
                  }}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Absolute positioning */
          <>
            {desktopIcons.map((item) => (
              <DesktopIcon
                key={item.id}
                icon={item.icon}
                label={item.label}
                onDoubleClick={item.onDoubleClick}
                initialPosition={iconPositions[item.id as keyof typeof iconPositions]}
                onPositionChange={(pos) => updateIconPosition(item.id as keyof typeof iconPositions, pos)}
                selected={selectedIcon === item.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIcon(item.id)
                }}
                isMobile={false}
              />
            ))}
          </>
        )}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-black border-white/20 text-white">
          <ContextMenuItem onClick={handleRefresh} className="focus:bg-white/10 cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>{t.desktop.refresh}</span>
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-white/20" />
          <ContextMenuItem onClick={onOpenSettings} className="focus:bg-white/10 cursor-pointer">
            <Monitor className="mr-2 h-4 w-4" />
            <span>{t.desktop.displaySettings}</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
