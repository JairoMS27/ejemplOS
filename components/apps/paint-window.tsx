"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Save, Trash2, Eraser, Pencil } from "lucide-react"

interface PaintWindowProps {
  onSave?: (fileName: string, dataUrl: string) => void
}

export function PaintWindow({ onSave }: PaintWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil")
  const [fileName, setFileName] = useState("dibujo.png")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set initial white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")

    // Save to localStorage for Finder visibility
    const savedImages = JSON.parse(localStorage.getItem("paint_images") || "[]")
    const newImage = {
      name: fileName,
      date: new Date().toISOString(),
      dataUrl,
    }
    localStorage.setItem("paint_images", JSON.stringify([...savedImages, newImage]))

    // Trigger download as fallback/user feedback
    const link = document.createElement("a")
    link.download = fileName
    link.href = dataUrl
    link.click()

    alert("Imagen guardada en 'Imágenes' y descargada.")
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-white/20">
      {/* Toolbar */}
      <div className="flex items-center gap-4 h-12 px-4 bg-zinc-900/50 border-b border-white/10 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-1 bg-zinc-800/50 rounded-md p-1 border border-white/10">
          <button
            onClick={() => setTool("pencil")}
            className={`p-2 rounded transition-colors ${tool === "pencil" ? "bg-white/20 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}
            title="Lápiz"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded transition-colors ${tool === "eraser" ? "bg-white/20 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}
            title="Borrador"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-zinc-400">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
            disabled={tool === "eraser"}
          />
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-zinc-400">Tamaño:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-zinc-300 w-6 text-center">{brushSize}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="px-3 py-1.5 text-sm bg-zinc-800/50 border border-white/10 rounded-md w-36 text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            onClick={clearCanvas}
            className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors border border-transparent hover:border-red-500/30"
            title="Borrar todo"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-6 bg-black/20 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white shadow-2xl shadow-black/50 cursor-crosshair rounded-sm"
        />
      </div>

      {/* Status Bar */}
      <div className="flex h-8 items-center justify-between border-t border-white/10 bg-zinc-900/50 px-4 text-[10px] font-medium text-zinc-500 backdrop-blur-xl flex-shrink-0">
        <div className="flex gap-4">
          <span>800 × 600 px</span>
          <span>Herramienta: {tool === "pencil" ? "Lápiz" : "Borrador"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
          <span>{brushSize}px</span>
        </div>
      </div>
    </div>
  )
}
