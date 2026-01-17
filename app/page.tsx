"use client"

import { useState, useEffect } from "react"
import { Desktop } from "@/components/desktop"
import { TaskBar } from "@/components/taskbar"
import { WindowManager } from "@/components/window-manager"
import { BootScreen } from "@/components/boot-screen"
import { ChangelogModal } from "@/components/changelog-modal"
import { AudioProvider } from "@/lib/audio-context"
import { SettingsProvider, useSettings } from "@/lib/settings-context"
import { I18nProvider, useI18n } from "@/lib/i18n-context"

function DesktopBackground() {
  const { settings } = useSettings()

  // Render wallpaper based on settings
  const renderWallpaper = () => {
    switch (settings.wallpaper.type) {
      case "solid":
        return (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: settings.wallpaper.color || "#000000" }}
          />
        )
      case "image":
        return settings.wallpaper.imageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${settings.wallpaper.imageUrl})`,
              backgroundSize: settings.wallpaper.imageFit || "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )
      default:
        return <div className="absolute inset-0 bg-black" />
    }
  }

  return (
    <div className="absolute inset-0">
      {renderWallpaper()}

      {/* Grid overlay */}
      {settings.desktop.showGrid && (
        <div
          className="absolute inset-0"
          style={{
            opacity: settings.desktop.gridOpacity / 100,
            backgroundImage: `
              linear-gradient(white 1px, transparent 1px),
              linear-gradient(90deg, white 1px, transparent 1px)
            `,
            backgroundSize: `${settings.desktop.gridSize}px ${settings.desktop.gridSize}px`,
          }}
        />
      )}

      {/* Watermark */}
      {settings.desktop.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1
            className="text-[20rem] font-bold text-white select-none"
            style={{ opacity: settings.desktop.watermarkOpacity / 100 }}
          >
            EJ
          </h1>
        </div>
      )}
    </div>
  )
}

function HomeContent() {
  const { t } = useI18n()
  const [booted, setBooted] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [openWindows, setOpenWindows] = useState<
    Array<{
      id: string
      type: "browser" | "minesweeper" | "finder" | "games" | "projects" | "tetris" | "2048" | "paint" | "snake" | "settings" | "file" | "ejpod"
      title: string
      zIndex: number
      fileName?: string
      fileType?: string
      imageUrl?: string
      audioUrl?: string
      initialUrl?: string
      initialPath?: string
      isMaximized?: boolean
      isMinimized?: boolean
      savedSize?: { width: number; height: number }
      savedPosition?: { x: number; y: number }
    }>
  >([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooted(true)
      setShowChangelog(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const getWindowTitle = (type: string) => {
    const titles: Record<string, string> = {
      browser: t.windows.browser,
      minesweeper: t.windows.minesweeper,
      finder: t.windows.finder,
      games: t.windows.games,
      projects: t.windows.myProjects,
      tetris: t.windows.tetris,
      "2048": t.windows["2048"],
      paint: t.windows.paint,
      settings: t.windows.settings,
      ejpod: t.windows.ejpod,
      snake: t.windows.snake,
    }
    return titles[type] || type
  }

  const openApplication = (
    type: "browser" | "minesweeper" | "finder" | "games" | "projects" | "tetris" | "2048" | "paint" | "snake" | "settings" | "ejpod",
    initialUrl?: string,
  ) => {
    const newWindow = {
      id: `${type}-${Date.now()}`,
      type,
      title: getWindowTitle(type),
      zIndex: Math.max(...openWindows.map((w) => w.zIndex), 0) + 1,
      initialUrl: initialUrl,
      isMaximized: false,
      isMinimized: false,
      savedSize:
        type === "minesweeper"
          ? { width: 500, height: 600 }
          : type === "tetris" || type === "2048" || type === "snake"
            ? { width: 500, height: 700 }
            : type === "games" || type === "projects"
              ? { width: 700, height: 600 }
              : type === "paint"
                ? { width: 900, height: 700 }
                : type === "settings"
                  ? { width: 800, height: 600 }
                  : type === "ejpod"
                    ? { width: 320, height: 580 }
                    : { width: 900, height: 600 },
      savedPosition: { x: 100 + openWindows.length * 30, y: 100 + openWindows.length * 30 },
    }
    setOpenWindows([...openWindows, newWindow])
  }

  const openGamesFolder = () => {
    openApplication("games")
  }

  const openProjectsFolder = () => {
    openApplication("projects")
  }

  const openGame = (gameType: "minesweeper" | "tetris" | "2048" | "snake") => {
    openApplication(gameType)
  }

  const openFile = (fileName: string, fileType: string, mediaUrl?: string) => {
    // If it's a music file, open EjPod instead of the old player
    if (fileType === "music" && mediaUrl) {
      const newWindow = {
        id: `ejpod-${Date.now()}`,
        type: "ejpod" as const,
        title: "EjPod",
        zIndex: Math.max(...openWindows.map((w) => w.zIndex), 0) + 1,
        fileName,
        fileType,
        audioUrl: mediaUrl,
        isMaximized: false,
        isMinimized: false,
        savedSize: { width: 320, height: 580 },
        savedPosition: { x: 150 + openWindows.length * 30, y: 50 + openWindows.length * 30 },
      }
      setOpenWindows([...openWindows, newWindow])
      return
    }

    const newWindow = {
      id: `file-${Date.now()}`,
      type: "file" as const,
      title: fileName,
      zIndex: Math.max(...openWindows.map((w) => w.zIndex), 0) + 1,
      fileName,
      fileType,
      imageUrl: fileType === "image" ? mediaUrl : undefined,
      audioUrl: fileType === "music" ? mediaUrl : undefined,
      isMaximized: false,
      isMinimized: false,
      savedSize: { width: 800, height: 600 },
      savedPosition: { x: 150 + openWindows.length * 30, y: 150 + openWindows.length * 30 },
    }
    setOpenWindows([...openWindows, newWindow])
  }

  const openApp = (appType: "browser" | "paint" | "ejpod" | "settings", url?: string) => {
    openApplication(appType, url)
  }

  const openFinder = (path?: string) => {
    const newWindow = {
      id: `finder-${Date.now()}`,
      type: "finder" as const,
      title: "Finder",
      zIndex: Math.max(...openWindows.map((w) => w.zIndex), 0) + 1,
      isMaximized: false,
      isMinimized: false,
      savedSize: { width: 900, height: 600 },
      savedPosition: { x: 100 + openWindows.length * 30, y: 100 + openWindows.length * 30 },
      initialPath: path,
    }
    setOpenWindows([...openWindows, newWindow])
  }

  const closeWindow = (id: string) => {
    setOpenWindows(openWindows.filter((w) => w.id !== id))
  }

  const focusWindow = (id: string) => {
    const maxZ = Math.max(...openWindows.map((w) => w.zIndex))
    setOpenWindows(openWindows.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w)))
  }

  const minimizeWindow = (id: string) => {
    setOpenWindows(openWindows.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w)))
  }

  const maximizeWindow = (id: string) => {
    setOpenWindows(openWindows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)))
  }

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setOpenWindows(openWindows.map((w) => (w.id === id ? { ...w, savedSize: size } : w)))
  }

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setOpenWindows(openWindows.map((w) => (w.id === id ? { ...w, savedPosition: position } : w)))
  }

  const minimizedWindows = openWindows.filter((w) => w.isMinimized).map((w) => ({ id: w.id, title: w.title }))

  if (!booted) {
    return <BootScreen />
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* BETA Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/90 backdrop-blur-sm px-5 py-2 rounded-lg border border-white">
          {/* Animated dots */}
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          {/* Text */}
          <span className="text-sm font-bold text-white">
            BETA
          </span>
          <span className="text-white/50 text-xs">—</span>
          <span className="text-xs text-white/70 font-medium tracking-wide">
            {t.common.workInProgress}
          </span>
        </div>
      </div>

      {/* Dynamic Desktop Background */}
      <DesktopBackground />

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Desktop area */}
        <div className="flex-1 overflow-hidden relative">
          <Desktop onOpenGamesFolder={openGamesFolder} onOpenProjectsFolder={openProjectsFolder} onOpenApp={openApp} onOpenSettings={() => openApplication("settings")} onOpenEjPod={() => openApplication("ejpod")} onOpenBrowser={() => openApplication("browser")} />

          {/* Windows */}
          <WindowManager
            windows={openWindows}
            onClose={closeWindow}
            onFocus={focusWindow}
            onOpenFile={openFile}
            onOpenGame={openGame}
            onOpenApp={openApp}
            onOpenFinder={openFinder}
            onOpenProjects={openProjectsFolder}
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            onSizeChange={updateWindowSize}
            onPositionChange={updateWindowPosition}
          />
        </div>

        {/* TaskBar area */}
        <TaskBar onAppClick={openApplication} minimizedWindows={minimizedWindows} onRestoreWindow={minimizeWindow} />
      </div>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  )
}

export default function Home() {
  return (
    <I18nProvider>
      <SettingsProvider>
        <AudioProvider>
          <HomeContent />
        </AudioProvider>
      </SettingsProvider>
    </I18nProvider>
  )
}
