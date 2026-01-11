"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react"

interface AudioContextType {
  currentTrack: {
    fileName: string
    audioUrl: string
    windowId?: string
  } | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  play: (fileName: string, audioUrl: string, windowId?: string) => void
  pause: () => void
  togglePlayPause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  skipTime: (seconds: number) => void
  stop: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<{
    fileName: string
    audioUrl: string
    windowId?: string
  } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pendingPlayRef = useRef<Promise<void> | null>(null)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()

    const audio = audioRef.current

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.pause()
    }
  }, [])

  const play = useCallback(
    async (fileName: string, audioUrl: string, windowId?: string) => {
      if (!audioRef.current) return

      // Cancel any pending play operation
      if (pendingPlayRef.current) {
        try {
          await pendingPlayRef.current
        } catch {
          // Ignore errors from cancelled operations
        }
      }

      const audio = audioRef.current

      // If it's a different track, load it
      if (currentTrack?.audioUrl !== audioUrl) {
        // Pause and reset current audio
        audio.pause()
        audio.currentTime = 0

        // Set new source
        audio.src = audioUrl
        audio.volume = volume
        audio.muted = isMuted

        setCurrentTrack({ fileName, audioUrl, windowId })
        setCurrentTime(0)

        // Wait for audio to be ready
        try {
          await audio.load()
        } catch (error) {
          console.error("[v0] Error loading audio:", error)
          return
        }
      }

      // Start playing
      try {
        pendingPlayRef.current = audio.play()
        await pendingPlayRef.current
        pendingPlayRef.current = null
      } catch (error) {
        pendingPlayRef.current = null
        // Only log if it's not an abort error (which is expected when changing tracks)
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("[v0] Error playing audio:", error.message)
        }
      }
    },
    [currentTrack, volume, isMuted],
  )

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else if (currentTrack) {
      play(currentTrack.fileName, currentTrack.audioUrl, currentTrack.windowId)
    }
  }, [isPlaying, pause, currentTrack, play])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev
      if (audioRef.current) {
        audioRef.current.muted = newMuted
      }
      return newMuted
    })
  }, [])

  const skipTime = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCurrentTrack(null)
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        play,
        pause,
        togglePlayPause,
        seek,
        setVolume,
        toggleMute,
        skipTime,
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
