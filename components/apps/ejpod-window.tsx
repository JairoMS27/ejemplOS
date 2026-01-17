"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Music, Play, Pause, ChevronUp, ChevronDown, SkipBack, SkipForward, X, Minus } from "lucide-react"
import { useAudio } from "@/lib/audio-context"

interface Track {
  name: string
  audioUrl: string
}

interface EjPodWindowProps {
  isMaximized?: boolean
  windowId?: string
  initialTrack?: {
    fileName: string
    audioUrl: string
  }
  onClose?: () => void
  onMinimize?: () => void
  onFocus?: () => void
  zIndex?: number
  savedPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
}

export function EjPodWindow({ isMaximized, windowId, initialTrack, onClose, onMinimize, onFocus, zIndex = 1, savedPosition, onPositionChange }: EjPodWindowProps) {
  const audio = useAudio()
  const audioRef = useRef(audio)
  const [position, setPosition] = useState(savedPosition || { x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [menuMode, setMenuMode] = useState<"songs" | "nowPlaying">("songs")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // Keep audioRef updated
  useEffect(() => {
    audioRef.current = audio
  }, [audio])

  // Cleanup: stop audio when component unmounts
  useEffect(() => {
    return () => {
      // Stop audio when this EjPod window closes
      audioRef.current.stop()
    }
  }, [])

  // Load tracks from Música folder
  useEffect(() => {
    const musicTracks: Track[] = [
      {
        name: "NO LOVE MODE",
        audioUrl: "https://image2url.com/r2/default/audio/1768434262419-43b9ab05-0f25-480d-94dc-4c633ad19eb5.wav",
      },
      {
        name: "GHOST USER",
        audioUrl: "https://image2url.com/r2/default/audio/1768434396376-72504136-d644-4499-9ae4-a4030924f5ab.flac",
      },
      {
        name: "VENENO",
        audioUrl: "https://image2url.com/r2/default/audio/1768434467002-479e1ed9-7177-4fca-a72a-63b262a7d874.mp3",
      },
      {
        name: "NEON VEINS",
        audioUrl: "https://image2url.com/r2/default/audio/1768434524284-2a665fb6-edc4-4c92-988b-45d0846438dd.mp3",
      },
      {
        name: "gema fake",
        audioUrl: "https://image2url.com/r2/default/audio/1768434507735-f5538049-4d29-43b3-818d-1cfbd2461351.mp3",
      },
    ]
    setTracks(musicTracks)

    // If opened with a specific track, find and select it
    if (initialTrack) {
      const trackIndex = musicTracks.findIndex(t => t.audioUrl === initialTrack.audioUrl)
      if (trackIndex !== -1) {
        setSelectedIndex(trackIndex)
        setMenuMode("nowPlaying")
        // Auto-play the track
        setTimeout(() => {
          audio.play(initialTrack.fileName, initialTrack.audioUrl, windowId)
        }, 100)
      }
    }
  }, [initialTrack, windowId, audio])

  const currentTrack = tracks[selectedIndex]
  const isCurrentTrack = audio.currentTrack?.audioUrl === currentTrack?.audioUrl
  const isPlaying = isCurrentTrack && audio.isPlaying

  // Dragging logic
  useEffect(() => {
    if (savedPosition && (savedPosition.x !== position.x || savedPosition.y !== position.y)) {
      setPosition(savedPosition)
    }
  }, [savedPosition?.x, savedPosition?.y])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: Math.max(0, e.clientY - dragOffset.y),
        }
        setPosition(newPosition)
        onPositionChange?.(newPosition)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, onPositionChange])

  const handleDragStart = (e: React.MouseEvent) => {
    onFocus?.()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  // Setup audio analyser for visualizer
  useEffect(() => {
    if (!isPlaying) return

    const setupAnalyser = async () => {
      try {
        // Find the audio element from the AudioProvider
        const audioElements = document.getElementsByTagName('audio')
        if (audioElements.length === 0) return

        const audioElement = audioElements[0]

        // Create audio context if needed
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }

        // Check if this audio element is different from the last one
        if (audioElementRef.current !== audioElement) {
          audioElementRef.current = audioElement

          // Reset refs when audio element changes
          sourceRef.current = null
          analyserRef.current = null
        }

        // Only create new source if we haven't already for this element
        if (!analyserRef.current) {
          try {
            // Check if element already has a source by looking for our marker
            const existingSource = (audioElement as any)._audioSourceNode

            if (existingSource) {
              // Reuse existing source
              sourceRef.current = existingSource
              analyserRef.current = audioContextRef.current.createAnalyser()
              analyserRef.current.fftSize = 256
              analyserRef.current.smoothingTimeConstant = 0.8

              // Disconnect and reconnect to insert analyser
              if (sourceRef.current) {
                sourceRef.current.disconnect()
                sourceRef.current.connect(analyserRef.current)
              }
              analyserRef.current.connect(audioContextRef.current.destination)
            } else {
              // Create new source
              sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
              // Store reference on the element to prevent duplicate creation
              ;(audioElement as any)._audioSourceNode = sourceRef.current

              analyserRef.current = audioContextRef.current.createAnalyser()
              analyserRef.current.fftSize = 256
              analyserRef.current.smoothingTimeConstant = 0.8

              sourceRef.current.connect(analyserRef.current)
              analyserRef.current.connect(audioContextRef.current.destination)
            }
          } catch (e) {
            console.log("Audio source setup failed, using fallback visualizer:", e)
          }
        }
      } catch (error) {
        console.error("Error setting up audio analyser:", error)
      }
    }

    setupAnalyser()
  }, [isPlaying, currentTrack?.audioUrl])

  // Canvas visualizer drawing
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)

    if (!isPlaying) {
      // Draw idle state - subtle glow
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      animationRef.current = requestAnimationFrame(drawVisualizer)
      return
    }

    let dataArray: Uint8Array
    const bufferLength = analyser ? analyser.frequencyBinCount : 128

    if (analyser) {
      const tempArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(tempArray)
      dataArray = tempArray
    } else {
      // Fallback: generate animated data based on time
      const time = Date.now() / 1000
      dataArray = new Uint8Array(bufferLength)
      for (let i = 0; i < bufferLength; i++) {
        const wave1 = Math.sin(time * 3 + i * 0.1) * 0.3 + 0.5
        const wave2 = Math.sin(time * 5 + i * 0.2) * 0.2
        const wave3 = Math.sin(time * 2 + i * 0.05) * 0.3
        const combined = wave1 + wave2 + wave3
        // More bass in lower frequencies
        const bassBoost = i < bufferLength / 4 ? 1.5 : 1
        dataArray[i] = Math.min(255, Math.max(0, combined * 180 * bassBoost))
      }
    }

    // Draw the circular visualizer (Windows Media Player style)
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 2.5

    // Background glow
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.5)
    bgGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)')
    bgGradient.addColorStop(0.5, 'rgba(88, 28, 135, 0.08)')
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Draw circular bars
    const barCount = 64
    const angleStep = (Math.PI * 2) / barCount

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * bufferLength)
      const value = dataArray[dataIndex] || 0
      const normalizedValue = value / 255

      const angle = i * angleStep - Math.PI / 2
      const innerRadius = maxRadius * 0.3
      const barLength = normalizedValue * maxRadius * 0.7

      const x1 = centerX + Math.cos(angle) * innerRadius
      const y1 = centerY + Math.sin(angle) * innerRadius
      const x2 = centerX + Math.cos(angle) * (innerRadius + barLength)
      const y2 = centerY + Math.sin(angle) * (innerRadius + barLength)

      // Color based on frequency and intensity
      const hue = 270 + (i / barCount) * 60 // Purple to blue range
      const saturation = 80 + normalizedValue * 20
      const lightness = 40 + normalizedValue * 30

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`)
      gradient.addColorStop(1, `hsla(${hue + 30}, ${saturation}%, ${lightness + 20}%, 1)`)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()

      // Add glow effect
      ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`
      ctx.shadowBlur = 8
    }

    // Draw center circle
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.25)
    centerGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    centerGradient.addColorStop(0.7, 'rgba(88, 28, 135, 0.2)')
    centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)')

    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = centerGradient
    ctx.fill()

    // Draw outer ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * 0.28, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.shadowBlur = 0

    animationRef.current = requestAnimationFrame(drawVisualizer)
  }, [isPlaying])

  useEffect(() => {
    drawVisualizer()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [drawVisualizer])

  const playTrack = (index: number) => {
    const track = tracks[index]
    if (track) {
      audio.play(track.name, track.audioUrl, windowId)
      setSelectedIndex(index)
      setMenuMode("nowPlaying")
    }
  }

  const togglePlayPause = () => {
    if (currentTrack) {
      if (isCurrentTrack) {
        audio.togglePlayPause()
      } else {
        audio.play(currentTrack.name, currentTrack.audioUrl, windowId)
      }
    }
  }

  const nextTrack = () => {
    const nextIndex = (selectedIndex + 1) % tracks.length
    playTrack(nextIndex)
  }

  const prevTrack = () => {
    const prevIndex = (selectedIndex - 1 + tracks.length) % tracks.length
    playTrack(prevIndex)
  }

  const handleScrollUp = () => {
    if (menuMode === "songs") {
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const handleScrollDown = () => {
    if (menuMode === "songs") {
      setSelectedIndex((prev) => Math.min(tracks.length - 1, prev + 1))
    }
  }

  const handleSelect = () => {
    if (menuMode === "songs") {
      playTrack(selectedIndex)
    }
  }

  const handleMenu = () => {
    setMenuMode(menuMode === "songs" ? "nowPlaying" : "songs")
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      className="fixed select-none animate-window-open"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
      }}
      onMouseDown={() => onFocus?.()}
    >
      {/* EjPod Body */}
      <div className="relative w-[280px] bg-gradient-to-b from-zinc-200 to-zinc-400 rounded-[2rem] shadow-2xl border border-zinc-300 flex flex-col overflow-hidden">

        {/* Window Controls - Draggable area */}
        <div
          className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 cursor-move"
          onMouseDown={handleDragStart}
        >
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Stop audio if this window is playing it
                if (audio.currentTrack?.windowId === windowId) {
                  audio.stop()
                }
                onClose?.()
              }}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
              title="Cerrar"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMinimize?.()
              }}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-sm"
              title="Minimizar"
            />
          </div>
        </div>

        {/* Kawaii Stickers */}
        <div className="absolute top-1 right-3 z-10 text-2xl transform rotate-12 drop-shadow-md">
          ⭐
        </div>
        <div className="absolute bottom-24 right-1 z-10 text-xl transform -rotate-6 drop-shadow-md">
          🌸
        </div>
        <div className="absolute bottom-32 left-1 z-10 text-lg transform rotate-12 drop-shadow-md">
          ✨
        </div>

        {/* Screen Container */}
        <div className="mx-4 mt-8 mb-2 flex-shrink-0">
          <div className="bg-black rounded-lg overflow-hidden border-4 border-zinc-800 shadow-inner">
            {/* Screen */}
            <div className="h-[180px] relative overflow-hidden">
              {menuMode === "nowPlaying" ? (
                /* Now Playing View with Visualizer */
                <div className="w-full h-full relative">
                  <canvas
                    ref={canvasRef}
                    width={252}
                    height={180}
                    className="w-full h-full"
                  />
                  {/* Track info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                    <p className="text-white text-xs font-bold truncate text-center">
                      {currentTrack?.name.replace('.mp3', '') || 'No track'}
                    </p>
                    {isCurrentTrack && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-zinc-400 text-[10px] font-mono">
                          {formatTime(audio.currentTime)}
                        </span>
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full max-w-[100px] overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-200"
                            style={{ width: `${(audio.currentTime / audio.duration) * 100 || 0}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 text-[10px] font-mono">
                          {formatTime(audio.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Playing indicator */}
                  {isPlaying && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-white rounded-full"
                            style={{
                              animation: `equalizer 0.5s ease-in-out infinite`,
                              animationDelay: `${i * 0.1}s`,
                              height: '8px',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Songs Menu */
                <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black">
                  {/* Header */}
                  <div className="bg-zinc-800 px-3 py-1.5 border-b border-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-bold">EjPod</span>
                      <div className="flex items-center gap-1">
                        {isPlaying && (
                          <Play className="w-3 h-3 text-white fill-white" />
                        )}
                        <Music className="w-3 h-3 text-zinc-400" />
                      </div>
                    </div>
                  </div>

                  {/* Song List */}
                  <div className="overflow-hidden h-[calc(100%-28px)]">
                    <div className="py-1">
                      {tracks.map((track, index) => (
                        <div
                          key={track.audioUrl}
                          className={`px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                            index === selectedIndex
                              ? "bg-white text-black"
                              : "text-white hover:bg-zinc-800"
                          }`}
                          onClick={() => {
                            setSelectedIndex(index)
                            playTrack(index)
                          }}
                        >
                          <Music className={`w-3 h-3 flex-shrink-0 ${
                            index === selectedIndex ? "text-black" : "text-zinc-500"
                          }`} />
                          <span className="text-xs truncate flex-1">
                            {track.name.replace('.mp3', '')}
                          </span>
                          {audio.currentTrack?.audioUrl === track.audioUrl && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className={`w-0.5 rounded-full ${
                                    index === selectedIndex ? "bg-black" : "bg-white"
                                  }`}
                                  style={{
                                    animation: isPlaying ? `equalizer 0.5s ease-in-out infinite` : 'none',
                                    animationDelay: `${i * 0.1}s`,
                                    height: isPlaying ? '8px' : '4px',
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EjPod label */}
        <div className="text-center mb-2">
          <span className="text-zinc-600 text-[10px] font-medium tracking-widest">EjPod</span>
        </div>

        {/* Click Wheel */}
        <div className="flex-1 flex items-center justify-center pb-4">
          <div className="relative w-[160px] h-[160px]">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-zinc-100 to-zinc-300 shadow-lg border border-zinc-400">
              {/* Touch areas */}

              {/* Menu button (top) */}
              <button
                onClick={handleMenu}
                className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-800 transition-colors z-10"
              >
                <span className="text-[10px] font-bold tracking-wider">MENU</span>
              </button>

              {/* Previous button (left) */}
              <button
                onClick={prevTrack}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center text-zinc-600 hover:text-zinc-800 transition-colors z-10"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Next button (right) */}
              <button
                onClick={nextTrack}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center text-zinc-600 hover:text-zinc-800 transition-colors z-10"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Play/Pause button (bottom) */}
              <button
                onClick={togglePlayPause}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-800 transition-colors z-10"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              {/* Scroll indicators */}
              <button
                onClick={handleScrollUp}
                className="absolute top-8 left-1/2 -translate-x-1/2 text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleScrollDown}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Center button */}
            <button
              onClick={handleSelect}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-b from-zinc-100 to-zinc-300 shadow-inner border border-zinc-400 hover:from-zinc-200 hover:to-zinc-400 transition-all active:scale-95"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
