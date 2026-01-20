"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface WallpaperSettings {
  type: "default" | "solid" | "image"
  color?: string
  imageUrl?: string
  imageFit?: "cover" | "contain" | "fill" | "none"
}

export interface DesktopSettings {
  showGrid: boolean
  gridOpacity: number
  gridSize: number
  showWatermark: boolean
  watermarkOpacity: number
}

export interface UserSettings {
  name: string
  setupCompleted: boolean
  pinEnabled: boolean
  pin: string
}

export interface SystemSettings {
  wallpaper: WallpaperSettings
  desktop: DesktopSettings
  animations: boolean
  accentColor: string
  user: UserSettings
}

interface SettingsContextType {
  settings: SystemSettings
  updateWallpaper: (wallpaper: Partial<WallpaperSettings>) => void
  updateDesktop: (desktop: Partial<DesktopSettings>) => void
  updateSettings: (newSettings: Partial<SystemSettings>) => void
  updateUser: (user: Partial<UserSettings>) => void
  completeSetup: () => void
  verifyPin: (pin: string) => boolean
  resetSettings: () => void
  getStorageUsage: () => { used: number; items: number }
  clearStorage: () => void
}

const defaultSettings: SystemSettings = {
  wallpaper: {
    type: "default",
    color: "#000000",
    imageUrl: "",
    imageFit: "cover",
  },
  desktop: {
    showGrid: true,
    gridOpacity: 10,
    gridSize: 50,
    showWatermark: true,
    watermarkOpacity: 20,
  },
  animations: true,
  accentColor: "#3b82f6",
  user: {
    name: "",
    setupCompleted: false,
    pinEnabled: false,
    pin: "",
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const SETTINGS_KEY = "ejemplos_settings"

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      } catch (error) {
        console.error("Error saving settings:", error)
      }
    }
  }, [settings, isLoaded])

  const updateWallpaper = useCallback((wallpaper: Partial<WallpaperSettings>) => {
    setSettings((prev) => ({
      ...prev,
      wallpaper: { ...prev.wallpaper, ...wallpaper },
    }))
  }, [])

  const updateDesktop = useCallback((desktop: Partial<DesktopSettings>) => {
    setSettings((prev) => ({
      ...prev,
      desktop: { ...prev.desktop, ...desktop },
    }))
  }, [])

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const updateUser = useCallback((user: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      user: { ...prev.user, ...user },
    }))
  }, [])

  const completeSetup = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      user: { ...prev.user, setupCompleted: true },
    }))
  }, [])

  const verifyPin = useCallback((pin: string) => {
    return settings.user.pin === pin
  }, [settings.user.pin])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  const getStorageUsage = useCallback(() => {
    let totalSize = 0
    let itemCount = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ""
        totalSize += key.length + value.length
        itemCount++
      }
    }

    return {
      used: totalSize * 2, // UTF-16 uses 2 bytes per character
      items: itemCount,
    }
  }, [])

  const clearStorage = useCallback(() => {
    const settingsBackup = localStorage.getItem(SETTINGS_KEY)
    localStorage.clear()
    if (settingsBackup) {
      localStorage.setItem(SETTINGS_KEY, settingsBackup)
    }
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateWallpaper,
        updateDesktop,
        updateSettings,
        updateUser,
        completeSetup,
        verifyPin,
        resetSettings,
        getStorageUsage,
        clearStorage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
