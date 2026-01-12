"use client"

import { useState, useEffect } from "react"
import { Desktop } from "@/components/desktop"
import { TaskBar } from "@/components/taskbar"
import { WindowManager } from "@/components/window-manager"
import { BootScreen } from "@/components/boot-screen"
import { ChangelogModal } from "@/components/changelog-modal"
import { AudioProvider } from "@/lib/audio-context"

export default function Home() {
  const [booted, setBooted] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [openWindows, setOpenWindows] = useState<
    Array<{
      id: string
      type: "browser" | "minesweeper" | "finder" | "games" | "tetris" | "2048" | "paint" | "snake"
      title: string
      zIndex: number
      fileName?: string
      fileType?: string
      imageUrl?: string
      audioUrl?: string
      initialUrl?: string
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

  const openApplication = (
    type: "browser" | "minesweeper" | "finder" | "games" | "tetris" | "2048" | "paint" | "snake",
    initialUrl?: string,
  ) => {
    const newWindow = {
      id: `${type}-${Date.now()}`,
      type,
      title:
        type === "browser"
          ? "Navegador"
          : type === "minesweeper"
            ? "Buscaminas"
            : type === "finder"
              ? "Finder"
              : type === "games"
                ? "Juegos"
                : type === "tetris"
                  ? "Tetris"
                  : type === "2048"
                    ? "2048"
                    : type === "paint"
                      ? "Paint"
                      : "Snake",
      zIndex: Math.max(...openWindows.map((w) => w.zIndex), 0) + 1,
      initialUrl: initialUrl,
      isMaximized: false,
      isMinimized: false,
      savedSize:
        type === "minesweeper"
          ? { width: 500, height: 600 }
          : type === "tetris" || type === "2048" || type === "snake"
            ? { width: 500, height: 700 }
            : type === "games"
              ? { width: 700, height: 600 }
              : type === "paint"
                ? { width: 900, height: 700 }
                : { width: 900, height: 600 },
      savedPosition: { x: 100 + openWindows.length * 30, y: 100 + openWindows.length * 30 },
    }
    setOpenWindows([...openWindows, newWindow])
  }

  const openGamesFolder = () => {
    openApplication("games")
  }

  const openGame = (gameType: "minesweeper" | "tetris" | "2048" | "snake") => {
    openApplication(gameType)
  }

  const openFile = (fileName: string, fileType: string, mediaUrl?: string) => {
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

  const openApp = (appType: "browser" | "paint", url?: string) => {
    openApplication(appType, url)
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
    <AudioProvider>
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            BETA 1.1
          </div>
        </div>

        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black" />

          {/* Cuadrícula de fondo */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(white 1px, transparent 1px),
                linear-gradient(90deg, white 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Letras EJ en el centro */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-[20rem] font-bold text-white opacity-20 select-none">EJ</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Desktop area */}
          <div className="flex-1 overflow-hidden relative">
            <Desktop onOpenGamesFolder={openGamesFolder} onOpenApp={openApp} />

            {/* Windows */}
            <WindowManager
              windows={openWindows}
              onClose={closeWindow}
              onFocus={focusWindow}
              onOpenFile={openFile}
              onOpenGame={openGame}
              onOpenApp={openApp}
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
    </AudioProvider>
  )
}
