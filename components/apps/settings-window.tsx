"use client"

import { useState, useRef, useEffect } from "react"
import {
  Paintbrush,
  Monitor,
  Volume2,
  VolumeX,
  HardDrive,
  Info,
  Upload,
  Image,
  Grid3X3,
  Type,
  RotateCcw,
  Trash2,
  Check,
  Sparkles,
  Languages,
} from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"

type SettingsTab = "personalization" | "display" | "sound" | "storage" | "language" | "about"

interface SettingsWindowProps {
  isMaximized?: boolean
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-white/10 text-white shadow-sm"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-blue-500" : "bg-zinc-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

// Predefined wallpaper colors
const presetColors = [
  "#000000", "#1a1a2e", "#16213e", "#0f3460",
  "#1e3a5f", "#2d4263", "#3d5a80", "#293241",
  "#14213d", "#1d3557", "#457b9d", "#2b2d42",
  "#3a0ca3", "#4361ee", "#4cc9f0", "#7209b7",
]

export function SettingsWindow({ isMaximized }: SettingsWindowProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("personalization")
  const { settings, updateWallpaper, updateDesktop, updateSettings, resetSettings, getStorageUsage, clearStorage } = useSettings()
  const audio = useAudio()
  const { t, language, setLanguage } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [storageInfo, setStorageInfo] = useState({ used: 0, items: 0 })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    setStorageInfo(getStorageUsage())
  }, [getStorageUsage])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        updateWallpaper({ type: "image", imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "personalization", label: t.settings.tabs.personalization, icon: <Paintbrush className="w-4 h-4" /> },
    { id: "display", label: t.settings.tabs.display, icon: <Monitor className="w-4 h-4" /> },
    { id: "sound", label: t.settings.tabs.sound, icon: <Volume2 className="w-4 h-4" /> },
    { id: "storage", label: t.settings.tabs.storage, icon: <HardDrive className="w-4 h-4" /> },
    { id: "language", label: t.settings.tabs.language, icon: <Languages className="w-4 h-4" /> },
    { id: "about", label: t.settings.tabs.about, icon: <Info className="w-4 h-4" /> },
  ]

  const getImageFitLabel = (fit: string) => {
    switch (fit) {
      case "cover": return t.settings.personalization.cover
      case "contain": return t.settings.personalization.contain
      case "fill": return t.settings.personalization.stretch
      case "none": return t.settings.personalization.original
      default: return fit
    }
  }

  return (
    <div className="flex flex-col sm:flex-row h-full bg-zinc-950 text-zinc-100">
      {/* Mobile Tab Bar */}
      <div className="flex sm:hidden h-12 items-center gap-1 px-2 bg-zinc-900/50 border-b border-white/10 overflow-x-auto flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-zinc-400"
            }`}
          >
            {tab.icon}
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden sm:flex w-52 bg-zinc-900/30 backdrop-blur-md border-r border-white/10 p-3 flex-col flex-shrink-0">
        <div className="mb-4 px-3 py-2">
          <h2 className="text-lg font-semibold text-white">{t.settings.title}</h2>
          <p className="text-xs text-zinc-500">{t.settings.systemConfig}</p>
        </div>
        <div className="space-y-1 flex-1">
          {tabs.map((tab) => (
            <SidebarItem
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.settings.resetAll}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-black/20">
        {/* Personalization Tab */}
        {activeTab === "personalization" && (
          <div className="space-y-4 sm:space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">{t.settings.personalization.title}</h2>
              <p className="text-xs sm:text-sm text-zinc-500">{t.settings.personalization.subtitle}</p>
            </div>

            {/* Wallpaper Type Selector */}
            <SettingsCard title={t.settings.personalization.wallpaper} description={t.settings.personalization.wallpaperDesc}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => updateWallpaper({ type: "default" })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    settings.wallpaper.type === "default"
                      ? "bg-white/10 border-blue-500 text-white"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="text-xs">{t.settings.personalization.default}</span>
                </button>
                <button
                  onClick={() => updateWallpaper({ type: "solid" })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    settings.wallpaper.type === "solid"
                      ? "bg-white/10 border-blue-500 text-white"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <Paintbrush className="w-5 h-5" />
                  <span className="text-xs">{t.settings.personalization.solidColor}</span>
                </button>
                <button
                  onClick={() => updateWallpaper({ type: "image" })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    settings.wallpaper.type === "image"
                      ? "bg-white/10 border-blue-500 text-white"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <Image className="w-5 h-5" />
                  <span className="text-xs">{t.settings.personalization.image}</span>
                </button>
              </div>

              {/* Solid Color Options */}
              {settings.wallpaper.type === "solid" && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400">{t.settings.personalization.selectColor}</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateWallpaper({ color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          settings.wallpaper.color === color
                            ? "border-blue-500 scale-110"
                            : "border-transparent hover:border-white/30"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-zinc-400">{t.settings.personalization.customColor}</span>
                    <input
                      type="color"
                      value={settings.wallpaper.color || "#000000"}
                      onChange={(e) => updateWallpaper({ color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20"
                    />
                    <span className="text-xs text-zinc-500 font-mono">{settings.wallpaper.color}</span>
                  </div>
                </div>
              )}

              {/* Image Upload Options */}
              {settings.wallpaper.type === "image" && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.settings.personalization.uploadImage}</span>
                  </button>

                  {settings.wallpaper.imageUrl && (
                    <>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                        <img
                          src={settings.wallpaper.imageUrl}
                          alt="Wallpaper preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xs text-white/70">{t.settings.personalization.preview}</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-zinc-400">{t.settings.personalization.imageFit}</p>
                        <div className="grid grid-cols-2 sm:flex gap-2">
                          {(["cover", "contain", "fill", "none"] as const).map((fit) => (
                            <button
                              key={fit}
                              onClick={() => updateWallpaper({ imageFit: fit })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                settings.wallpaper.imageFit === fit
                                  ? "bg-white/10 border-blue-500 text-white"
                                  : "border-white/10 text-zinc-400 hover:bg-white/5"
                              }`}
                            >
                              {getImageFitLabel(fit)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </SettingsCard>

            {/* Watermark Settings */}
            <SettingsCard title={t.settings.personalization.watermark} description={t.settings.personalization.watermarkDesc}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm">{t.settings.personalization.showWatermark}</span>
                  </div>
                  <ToggleSwitch
                    checked={settings.desktop.showWatermark}
                    onChange={(checked) => updateDesktop({ showWatermark: checked })}
                  />
                </div>
                {settings.desktop.showWatermark && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{t.settings.personalization.opacity}</span>
                      <span className="text-xs text-zinc-500">{settings.desktop.watermarkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={settings.desktop.watermarkOpacity}
                      onChange={(e) => updateDesktop({ watermarkOpacity: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}
              </div>
            </SettingsCard>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === "display" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{t.settings.display.title}</h2>
              <p className="text-sm text-zinc-500">{t.settings.display.subtitle}</p>
            </div>

            <SettingsCard title={t.settings.display.backgroundGrid} description={t.settings.display.backgroundGridDesc}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm">{t.settings.display.showGrid}</span>
                  </div>
                  <ToggleSwitch
                    checked={settings.desktop.showGrid}
                    onChange={(checked) => updateDesktop({ showGrid: checked })}
                  />
                </div>

                {settings.desktop.showGrid && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{t.settings.personalization.opacity}</span>
                        <span className="text-xs text-zinc-500">{settings.desktop.gridOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.desktop.gridOpacity}
                        onChange={(e) => updateDesktop({ gridOpacity: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{t.settings.display.cellSize}</span>
                        <span className="text-xs text-zinc-500">{settings.desktop.gridSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="10"
                        value={settings.desktop.gridSize}
                        onChange={(e) => updateDesktop({ gridSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </SettingsCard>

            <SettingsCard title={t.settings.display.animations} description={t.settings.display.animationsDesc}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm">{t.settings.display.systemAnimations}</span>
                </div>
                <ToggleSwitch
                  checked={settings.animations}
                  onChange={(checked) => updateSettings({ animations: checked })}
                />
              </div>
            </SettingsCard>
          </div>
        )}

        {/* Sound Tab */}
        {activeTab === "sound" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{t.settings.sound.title}</h2>
              <p className="text-sm text-zinc-500">{t.settings.sound.subtitle}</p>
            </div>

            <SettingsCard title={t.settings.sound.systemVolume} description={t.settings.sound.systemVolumeDesc}>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={audio.toggleMute}
                    className={`p-2 rounded-lg transition-colors ${
                      audio.isMuted ? "bg-red-500/20 text-red-400" : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {audio.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audio.isMuted ? 0 : audio.volume}
                    onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${audio.volume * 100}%, rgba(255,255,255,0.1) ${audio.volume * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <span className="text-sm text-zinc-400 w-12 text-right">
                    {Math.round((audio.isMuted ? 0 : audio.volume) * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-sm text-zinc-400">{t.settings.sound.muteAudio}</span>
                  <ToggleSwitch checked={audio.isMuted} onChange={audio.toggleMute} />
                </div>
              </div>
            </SettingsCard>

            {audio.currentTrack && (
              <SettingsCard title={t.settings.sound.nowPlaying} description={t.settings.sound.currentTrack}>
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{audio.currentTrack.fileName}</p>
                    <p className="text-xs text-zinc-500">
                      {audio.isPlaying ? t.settings.sound.playing : t.settings.sound.paused}
                    </p>
                  </div>
                </div>
              </SettingsCard>
            )}
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === "storage" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{t.settings.storage.title}</h2>
              <p className="text-sm text-zinc-500">{t.settings.storage.subtitle}</p>
            </div>

            <SettingsCard title={t.settings.storage.localStorageUsage} description={t.settings.storage.localStorageDesc}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-sm text-white">{t.settings.storage.spaceUsed}</p>
                    <p className="text-xs text-zinc-500">{storageInfo.items} {t.settings.storage.itemsSaved}</p>
                  </div>
                  <p className="text-lg font-semibold text-blue-400">{formatBytes(storageInfo.used)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{t.settings.storage.usage}</span>
                    <span className="text-zinc-500">{formatBytes(storageInfo.used)} / 5 MB</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min((storageInfo.used / (5 * 1024 * 1024)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title={t.settings.storage.savedData} description={t.settings.storage.savedDataDesc}>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm">{t.settings.storage.paintImages}</span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {localStorage.getItem("paint_images") ?
                      JSON.parse(localStorage.getItem("paint_images") || "[]").length + " " + t.settings.storage.images
                      : t.settings.storage.noData}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm">{t.settings.storage.systemConfig}</span>
                  </div>
                  <Check className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title={t.settings.storage.clearData} description={t.settings.storage.clearDataDesc}>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm border border-red-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.settings.storage.clearStorage}</span>
              </button>
            </SettingsCard>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === "language" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{t.settings.language.title}</h2>
              <p className="text-sm text-zinc-500">{t.settings.language.subtitle}</p>
            </div>

            <SettingsCard title={t.settings.language.selectLanguage} description={t.settings.language.selectLanguageDesc}>
              <div className="space-y-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all ${
                    language === "en"
                      ? "bg-white/10 border-blue-500 text-white"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">{t.settings.language.english}</p>
                      <p className="text-xs text-zinc-500">English</p>
                    </div>
                  </div>
                  {language === "en" && <Check className="w-5 h-5 text-blue-500" />}
                </button>

                <button
                  onClick={() => setLanguage("es")}
                  className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all ${
                    language === "es"
                      ? "bg-white/10 border-blue-500 text-white"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇪🇸</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">{t.settings.language.spanish}</p>
                      <p className="text-xs text-zinc-500">Espanol</p>
                    </div>
                  </div>
                  {language === "es" && <Check className="w-5 h-5 text-blue-500" />}
                </button>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{t.settings.about.title}</h2>
              <p className="text-sm text-zinc-500">{t.settings.about.subtitle}</p>
            </div>

            <SettingsCard title="EjemplOS" description="">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">EJ</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">EjemplOS</h3>
                    <p className="text-sm text-zinc-400">{t.settings.about.version}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {t.settings.about.description}
                </p>
              </div>
            </SettingsCard>

            <SettingsCard title={t.settings.about.technicalSpecs} description="">
              <div className="space-y-2">
                {[
                  { label: t.settings.about.framework, value: "Next.js 16" },
                  { label: t.settings.about.uiLibrary, value: "React 19" },
                  { label: t.settings.about.styles, value: "Tailwind CSS 4" },
                  { label: t.settings.about.language, value: "TypeScript 5" },
                  { label: t.settings.about.browserLabel, value: typeof navigator !== "undefined" ? navigator.userAgent.split(" ").slice(-2).join(" ") : t.settings.about.unknown },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-zinc-400">{item.label}</span>
                    <span className="text-sm text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard title={t.settings.about.features} description="">
              <div className="grid grid-cols-2 gap-2">
                {[
                  t.settings.about.featuresList.browser,
                  t.settings.about.featuresList.paint,
                  t.settings.about.featuresList.fileExplorer,
                  t.settings.about.featuresList.musicPlayer,
                  t.settings.about.featuresList.games,
                  t.settings.about.featuresList.resizableWindows,
                  t.settings.about.featuresList.desktopCustomization,
                  t.settings.about.featuresList.localStorage,
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </SettingsCard>

            <div className="text-center text-xs text-zinc-600 py-4">
              <p>© 2025 {t.settings.about.copyright}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">{t.settings.modals.resetTitle}</h3>
            <p className="text-sm text-zinc-400 mb-4">
              {t.settings.modals.resetMessage}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  resetSettings()
                  setShowResetConfirm(false)
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                {t.common.reset}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Storage Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">{t.settings.modals.clearStorageTitle}</h3>
            <p className="text-sm text-zinc-400 mb-4">
              {t.settings.modals.clearStorageMessage}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  clearStorage()
                  setStorageInfo(getStorageUsage())
                  setShowClearConfirm(false)
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                {t.settings.modals.clear}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
