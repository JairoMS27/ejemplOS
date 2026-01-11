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
    <div className="flex flex-col h-full bg-zinc-100 text-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-2 bg-zinc-200 border-b border-zinc-300">
        <div className="flex items-center gap-1 bg-white rounded-md p-1 border border-zinc-300">
          <button
            onClick={() => setTool("pencil")}
            className={`p-2 rounded ${tool === "pencil" ? "bg-blue-100 text-blue-600" : "hover:bg-zinc-100"}`}
            title="Lápiz"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded ${tool === "eraser" ? "bg-blue-100 text-blue-600" : "hover:bg-zinc-100"}`}
            title="Borrador"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-zinc-300" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-none"
            disabled={tool === "eraser"}
          />
        </div>

        <div className="h-8 w-px bg-zinc-300" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Tamaño:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs w-4">{brushSize}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="px-2 py-1 text-sm border border-zinc-300 rounded w-32"
          />
          <button
            onClick={clearCanvas}
            className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Borrar todo"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-4 bg-zinc-300 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white shadow-xl cursor-crosshair"
        />
      </div>
    </div>
  )
}
