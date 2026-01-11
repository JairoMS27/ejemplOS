"use client"

import type React from "react"

import { useState } from "react"
import {
  FileText,
  Music,
  File,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  ImageIcon,
} from "lucide-react"
import { useAudio } from "@/lib/audio-context"

interface FileWindowProps {
  fileName?: string
  fileType?: string
  imageUrl?: string
  audioUrl?: string
  isMaximized?: boolean
  windowId?: string
}

export function FileWindow({
  fileName = "archivo.txt",
  fileType = "document",
  imageUrl,
  audioUrl,
  isMaximized,
  windowId,
}: FileWindowProps) {
  const audio = useAudio()

  // Image viewer state
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const isCurrentTrack = audio.currentTrack?.audioUrl === audioUrl
  const isPlaying = isCurrentTrack && audio.isPlaying

  const togglePlay = () => {
    if (!audioUrl) return

    if (isCurrentTrack) {
      audio.togglePlayPause()
    } else {
      audio.play(fileName, audioUrl, windowId)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    audio.seek(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number.parseFloat(e.target.value)
    audio.setVolume(vol)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getFileIcon = () => {
    switch (fileType) {
      case "document":
        return <FileText className="w-12 h-12 text-gray-600" />
      case "music":
        return <Music className="w-12 h-12 text-white" />
      default:
        return <File className="w-12 h-12 text-gray-600" />
    }
  }

  const getFileContent = () => {
    switch (fileType) {
      case "document":
        return `Contenido del documento: ${fileName}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Este es un archivo de texto simulado.`
      default:
        return `Contenido del archivo: ${fileName}`
    }
  }

  if (fileType === "image") {
    return (
      <div className={`w-full flex flex-col bg-zinc-950 ${isMaximized ? "h-full" : "h-[600px]"}`}>
        {/* Header de imagen - Finder Style */}
        <div className="flex h-12 items-center gap-4 border-b border-white/10 bg-zinc-900/50 px-4 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{fileName}</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Toolbar de controles */}
          <div className="flex items-center gap-1 bg-zinc-800/50 rounded-md p-1 border border-white/5">
            <button
              onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
              className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-400 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <button
              onClick={() => setRotation((r) => r - 90)}
              className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
              title="Rotar izquierda"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation((r) => r + 90)}
              className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
              title="Rotar derecha"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <button
              onClick={() => {
                setZoom(1)
                setRotation(0)
              }}
              className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
              title="Restablecer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Área de visualización */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-black/20 relative">
          {/* Grid background pattern simulation */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {imageUrl ? (
            <div
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxWidth: "100%",
                maxHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                style={{ imageRendering: "high-quality" }}
                draggable={false}
              />
            </div>
          ) : (
            <div className="text-zinc-500 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No se pudo cargar la imagen</p>
            </div>
          )}
        </div>

        {/* Footer con información */}
        <div className="h-8 bg-zinc-900/50 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-between text-[10px] text-zinc-500 flex-shrink-0">
          <span>{fileName}</span>
          <span>
            {Math.round(zoom * 100)}% • {rotation}°
          </span>
        </div>
      </div>
    )
  }

  if (fileType === "music") {
    return (
      <div className={`w-full flex flex-col bg-zinc-950 ${isMaximized ? "h-full" : "h-full"}`}>
        {/* Header de música - Finder Style */}
        <div className="flex h-12 items-center gap-4 border-b border-white/10 bg-zinc-900/50 px-4 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{fileName}</p>
              <p className="text-[10px] text-zinc-500">Reproductor de música</p>
            </div>
          </div>
        </div>

        {/* Área principal del reproductor */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden bg-black/20">
          {/* Contenedor de Arte / Visualizador */}
          <div className="relative aspect-square w-auto h-auto max-h-[45%] max-w-[80%] mb-6 flex-shrink-1 min-h-[100px]">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group">
              {isPlaying ? (
                <div className="flex items-end justify-center gap-1 h-1/2 w-3/4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1/6 bg-white rounded-t-sm"
                      style={{
                        animation: `equalizer 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Music className="w-1/2 h-1/2 text-zinc-700" />
              )}
            </div>
          </div>

          {/* Información de la canción */}
          <div className="flex-shrink-0 text-center w-full px-4 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{fileName}</h2>
            <p className="text-xs text-zinc-500">Audio Track</p>
          </div>

          {/* Controles */}
          <div className="w-full max-w-md flex-shrink-0 px-2 flex flex-col gap-4">
            <div className="w-full group">
              <input
                type="range"
                min="0"
                max={isCurrentTrack ? audio.duration : 0}
                value={isCurrentTrack ? audio.currentTime : 0}
                onChange={handleSeek}
                disabled={!isCurrentTrack}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer block accent-white hover:h-1.5 transition-all"
                style={{
                  background: isCurrentTrack
                    ? `linear-gradient(to right, #ffffff 0%, #ffffff ${(audio.currentTime / audio.duration) * 100}%, rgba(255,255,255,0.1) ${(audio.currentTime / audio.duration) * 100}%, rgba(255,255,255,0.1) 100%)`
                    : "rgba(255,255,255,0.1)",
                }}
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>{isCurrentTrack ? formatTime(audio.currentTime) : "0:00"}</span>
                <span>{isCurrentTrack ? formatTime(audio.duration) : "0:00"}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => audio.skipTime(-10)}
                disabled={!isCurrentTrack}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-30"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white hover:bg-zinc-200 flex items-center justify-center text-black transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                )}
              </button>

              <button
                onClick={() => audio.skipTime(10)}
                disabled={!isCurrentTrack}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-30"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mx-auto w-full max-w-[200px] mt-2">
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
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer block accent-white"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${audio.volume * 100}%, rgba(255,255,255,0.1) ${audio.volume * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="h-8 bg-zinc-900/50 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-between text-[10px] text-zinc-500 flex-shrink-0">
          <span className="truncate max-w-[60%]">{fileName}</span>
          <span>MP3 • 320kbps</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-black/20 px-6 flex items-center gap-4">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <div>
          <h2 className="font-semibold text-black">{fileName}</h2>
          <p className="text-xs text-black/60">{fileType === "document" ? "Documento de texto" : "Archivo"}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <pre className="text-sm text-black whitespace-pre-wrap font-mono break-words">{getFileContent()}</pre>
      </div>

      {/* Status bar */}
      <div className="h-8 bg-gray-100 border-t border-black/20 px-6 flex items-center text-xs text-black/60">
        <span>Tamaño: {fileName.length * 12} bytes</span>
      </div>
    </div>
  )
}
