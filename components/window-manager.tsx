"use client"

import { BrowserWindow } from "./apps/browser-window"
import { MinesweeperWindow } from "./apps/minesweeper-window"
import { FinderWindow } from "./apps/finder-window"
import { FileWindow } from "./apps/file-window"
import { TetrisWindow } from "./apps/tetris-window"
import { Game2048 } from "./apps/game-2048"
import { Window } from "./window"
import { PaintWindow } from "./apps/paint-window"
import { SnakeWindow } from "./apps/snake-window"
import { SettingsWindow } from "./apps/settings-window"
import { ProjectsFolder } from "./apps/projects-folder"
import { EjPodWindow } from "./apps/ejpod-window"

interface OpenWindow {
  id: string
  type: "browser" | "minesweeper" | "finder" | "file" | "games" | "projects" | "tetris" | "2048" | "paint" | "snake" | "settings" | "ejpod"
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
}

interface WindowManagerProps {
  windows: OpenWindow[]
  onClose: (id: string) => void
  onFocus: (id: string) => void
  onOpenFile?: (fileName: string, fileType: string, imageUrl?: string) => void
  onOpenGame?: (gameType: "minesweeper" | "tetris" | "2048" | "snake") => void
  onOpenApp?: (appType: "browser" | "paint" | "ejpod" | "settings", url?: string) => void
  onOpenFinder?: (path?: string) => void
  onOpenProjects?: () => void
  onMinimize?: (id: string) => void
  onMaximize?: (id: string) => void
  onSizeChange?: (id: string, size: { width: number; height: number }) => void
  onPositionChange?: (id: string, position: { x: number; y: number }) => void
}

export function WindowManager({
  windows,
  onClose,
  onFocus,
  onOpenFile,
  onOpenGame,
  onOpenApp,
  onOpenFinder,
  onOpenProjects,
  onMinimize,
  onMaximize,
  onSizeChange,
  onPositionChange,
}: WindowManagerProps) {
  return (
    <>
      {windows.map((window) => {
        // EjPod renders as its own window without the standard Window wrapper
        if (window.type === "ejpod") {
          if (window.isMinimized) return null
          return (
            <EjPodWindow
              key={window.id}
              isMaximized={window.isMaximized}
              windowId={window.id}
              initialTrack={window.audioUrl ? { fileName: window.fileName || '', audioUrl: window.audioUrl } : undefined}
              onClose={() => onClose(window.id)}
              onMinimize={() => onMinimize?.(window.id)}
              onFocus={() => onFocus(window.id)}
              zIndex={window.zIndex}
              savedPosition={window.savedPosition}
              onPositionChange={(position) => onPositionChange?.(window.id, position)}
            />
          )
        }

        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            zIndex={window.zIndex}
            isMaximized={window.isMaximized}
            isMinimized={window.isMinimized}
            savedSize={window.savedSize}
            savedPosition={window.savedPosition}
            onClose={() => onClose(window.id)}
            onMinimize={() => onMinimize?.(window.id)}
            onMaximize={() => onMaximize?.(window.id)}
            onFocus={() => onFocus(window.id)}
            onSizeChange={(size) => onSizeChange?.(window.id, size)}
            onPositionChange={(position) => onPositionChange?.(window.id, position)}
          >
            {window.type === "browser" && <BrowserWindow initialUrl={window.initialUrl} />}
            {window.type === "minesweeper" && <MinesweeperWindow />}
            {window.type === "paint" && <PaintWindow />}
            {window.type === "snake" && <SnakeWindow />}
            {window.type === "finder" && (
              <FinderWindow
                onOpenFile={onOpenFile}
                onOpenGame={onOpenGame}
                onOpenApp={onOpenApp}
                onOpenProjects={onOpenProjects}
                isMaximized={window.isMaximized}
                initialPath={window.initialPath}
              />
            )}
            {window.type === "file" && (
              <FileWindow
                fileName={window.fileName}
                fileType={window.fileType}
                imageUrl={window.imageUrl}
                audioUrl={window.audioUrl}
                isMaximized={window.isMaximized}
                windowId={window.id}
              />
            )}
            {window.type === "games" && (
              <FinderWindow
                onOpenFile={onOpenFile}
                onOpenGame={onOpenGame}
                onOpenApp={onOpenApp}
                isMaximized={window.isMaximized}
                initialPath="Juegos"
              />
            )}
            {window.type === "tetris" && <TetrisWindow />}
            {window.type === "2048" && <Game2048 />}
            {window.type === "settings" && <SettingsWindow isMaximized={window.isMaximized} />}
            {window.type === "projects" && (
              <ProjectsFolder
                onOpenProject={(url) => onOpenApp?.("browser", url)}
                onOpenFinder={onOpenFinder}
                isMaximized={window.isMaximized}
              />
            )}
          </Window>
        )
      })}
    </>
  )
}
