"use client"

import { useState, useEffect, useRef } from "react"
import {
  Globe,
  Folder,
  Menu,
  Info,
  Gamepad2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Palette,
  Settings,
  Layers,
} from "lucide-react"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"

interface TaskBarProps {
  onAppClick: (app: "browser" | "games" | "finder" | "paint" | "settings" | "ejpod" | "imageEditor") => void
  minimizedWindows?: Array<{ id: string; title: string }>
  onRestoreWindow?: (id: string) => void
}

export function TaskBar({ onAppClick, minimizedWindows = [], onRestoreWindow }: TaskBarProps) {
  const [time, setTime] = useState("")
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showControlCenter, setShowControlCenter] = useState(false)
  const startMenuRef = useRef<HTMLDivElement>(null)
  const controlCenterRef = useRef<HTMLDivElement>(null)

  const audio = useAudio()
  const { t, language } = useI18n()

  useEffect(() => {
    const updateTime = () => {
      const locale = language === "es" ? "es-ES" : "en-US"
      setTime(new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [language])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
        setShowStartMenu(false)
      }
      if (controlCenterRef.current && !controlCenterRef.current.contains(event.target as Node)) {
        setShowControlCenter(false)
      }
    }

    if (showStartMenu || showControlCenter) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showStartMenu, showControlCenter])

  const apps = [
    { id: "browser", icon: Globe, label: t.taskbar.browser, type: "browser" as const },
    { id: "finder", icon: Folder, label: t.taskbar.finder, type: "finder" as const },
    { id: "ejpod", icon: Music, label: t.taskbar.ejpod, type: "ejpod" as const },
    { id: "paint", icon: Palette, label: t.taskbar.paint, type: "paint" as const },
    { id: "imageEditor", icon: Layers, label: t.taskbar.imageEditor, type: "imageEditor" as const },
    { id: "games", icon: Gamepad2, label: t.taskbar.games, type: "games" as const },
    { id: "settings", icon: Settings, label: t.taskbar.settings, type: "settings" as const },
  ]

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center px-1 sm:px-2 gap-1 sm:gap-2 z-50 select-none">
      {/* Start Button */}
      <div className="relative" ref={startMenuRef}>
        <button
          onClick={() => setShowStartMenu(!showStartMenu)}
          className={`flex items-center justify-center w-10 h-10 rounded hover:bg-white/10 transition-all ${showStartMenu ? "bg-white/20" : ""}`}
        >
          <span className="text-xl font-bold text-white tracking-tighter">EJ</span>
        </button>

        {/* Start Menu Dropdown */}
        {showStartMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="p-3 mb-2 border-b border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">{t.common.applications}</p>
            </div>
            <div className="space-y-1">
              {apps.map((app) => {
                const Icon = app.icon
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      onAppClick(app.type)
                      setShowStartMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition-all text-white text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    {app.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Separator - hidden on mobile */}
      <div className="hidden sm:block w-px h-8 bg-white/20" />

      {/* Quick Launch Icons - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        {apps.map((app) => {
          const Icon = app.icon
          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.type)}
              className="flex items-center justify-center w-10 h-10 rounded hover:bg-white/10 transition-all border border-transparent hover:border-white/20 group"
              title={app.label}
            >
              <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            </button>
          )
        })}
      </div>

      {minimizedWindows.length > 0 && (
        <>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[40vw] sm:max-w-none">
            {minimizedWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => onRestoreWindow?.(window.id)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs sm:text-sm text-white transition-all whitespace-nowrap flex-shrink-0"
                title={`Restaurar ${window.title}`}
              >
                <span className="hidden sm:inline">{window.title}</span>
                <span className="sm:hidden">{window.title.slice(0, 8)}{window.title.length > 8 ? '...' : ''}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Music player - hidden on mobile, show only play button */}
      {audio.currentTrack && (
        <>
          {/* Full player on desktop */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 max-w-[200px]">
            <Music className="w-4 h-4 text-white/70 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{audio.currentTrack.fileName}</p>
            </div>
            <button
              onClick={audio.togglePlayPause}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              {audio.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
          {/* Mini player on mobile */}
          <button
            onClick={audio.togglePlayPause}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-all"
          >
            {audio.isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
        </>
      )}

      <div className="relative" ref={controlCenterRef}>
        <button
          onClick={() => setShowControlCenter(!showControlCenter)}
          className={`flex items-center justify-center w-10 h-10 rounded hover:bg-white/10 transition-all border border-transparent hover:border-white/20 ${showControlCenter ? "bg-white/20" : ""}`}
          title="Centro de Control"
        >
          <Menu className="w-5 h-5 text-white/70" />
        </button>

        {showControlCenter && (
          <div className="absolute bottom-full right-0 mb-2 w-[calc(100vw-16px)] sm:w-80 max-w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-3 sm:p-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="mb-3 pb-3 border-b border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">{t.taskbar.controlCenter}</p>
            </div>

            {/* Audio Player Section */}
            {audio.currentTrack ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{audio.currentTrack.fileName}</p>
                    <p className="text-xs text-zinc-500">Audio Track</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={audio.duration || 0}
                    value={audio.currentTime}
                    onChange={(e) => audio.seek(Number.parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer block accent-white"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(audio.currentTime / audio.duration) * 100}%, rgba(255,255,255,0.1) ${(audio.currentTime / audio.duration) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{formatTime(audio.currentTime)}</span>
                    <span>{formatTime(audio.duration)}</span>
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => audio.skipTime(-10)}
                    className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={audio.togglePlayPause}
                    className="w-10 h-10 rounded-full bg-white hover:bg-zinc-200 flex items-center justify-center text-black transition-all"
                  >
                    {audio.isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    )}
                  </button>

                  <button
                    onClick={() => audio.skipTime(10)}
                    className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={audio.toggleMute}
                    className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                  >
                    {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audio.isMuted ? 0 : audio.volume}
                    onChange={(e) => audio.setVolume(Number.parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer block accent-white"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${audio.volume * 100}%, rgba(255,255,255,0.1) ${audio.volume * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">{t.common.noMusicPlaying}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info button - hidden on mobile */}
      <button
        onClick={() => setShowAbout(!showAbout)}
        className="hidden sm:flex items-center justify-center w-10 h-10 rounded hover:bg-white/10 transition-all border border-transparent hover:border-white/20"
        title={t.taskbar.aboutEjemplOS}
      >
        <Info className="w-5 h-5 text-white/70" />
      </button>

      {/* System Tray - Time */}
      <div className="flex items-center px-2 sm:px-3 py-2">
        <span className="text-xs sm:text-sm text-white font-medium tabular-nums">{time}</span>
      </div>

      {showAbout && (
        <div className="absolute bottom-14 sm:bottom-20 right-2 sm:right-4 w-[calc(100vw-16px)] sm:w-80 max-w-80 bg-black/95 backdrop-blur-xl border-2 border-white/30 rounded-lg shadow-2xl p-4 sm:p-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">EjemplOS</h3>
            <button onClick={() => setShowAbout(false)} className="text-white/60 hover:text-white transition-colors">
              ✕
            </button>
          </div>
          <div className="space-y-3 text-white/80 text-sm">
            <p className="leading-relaxed">{t.taskbar.systemDescription}</p>
            <div className="border-t border-white/10 pt-3">
              <p className="font-semibold text-white mb-2">{t.taskbar.features}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t.taskbar.featuresList.browser}</li>
                <li>{t.taskbar.featuresList.paint}</li>
                <li>{t.taskbar.featuresList.games}</li>
                <li>{t.taskbar.featuresList.fileExplorer}</li>
                <li>{t.taskbar.featuresList.resizableWindows}</li>
                <li>{t.taskbar.featuresList.musicPlayer}</li>
              </ul>
            </div>
            <div className="border-t border-white/10 pt-3 text-xs text-white/60">
              <p>{t.taskbar.version} 1.2.1</p>
              <p className="mt-1">© 2025 EjemplOS. {t.taskbar.allRightsReserved}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
