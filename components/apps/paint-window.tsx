"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Save,
  Trash2,
  Eraser,
  Pencil,
  Square,
  Circle,
  Minus,
  PaintBucket,
  Pipette,
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer2
} from "lucide-react"

interface PaintWindowProps {
  onSave?: (fileName: string, dataUrl: string) => void
}

type Tool = "pencil" | "eraser" | "line" | "rectangle" | "circle" | "fill" | "eyedropper" | "select"

interface HistoryState {
  imageData: ImageData
}

const COLOR_PALETTE = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#ff6600", "#6600ff", "#00ff66", "#ff0066",
  "#333333", "#666666", "#999999", "#cccccc", "#990000", "#009900",
  "#000099", "#999900", "#990099", "#009999", "#663300", "#336600",
]

export function PaintWindow({ onSave }: PaintWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [secondaryColor, setSecondaryColor] = useState("#ffffff")
  const [brushSize, setBrushSize] = useState(3)
  const [tool, setTool] = useState<Tool>("pencil")
  const [fileName, setFileName] = useState("dibujo.png")
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(100)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [canvasSize] = useState({ width: 800, height: 600 })
  const tempCanvasRef = useRef<HTMLCanvasElement>(null)

  // Save state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ imageData })

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current
    if (!canvas || !tempCanvas) return

    const ctx = canvas.getContext("2d")
    const tempCtx = tempCanvas.getContext("2d")
    if (!ctx || !tempCtx) return

    // Set initial white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([{ imageData }])
    setHistoryIndex(0)
  }, [])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newIndex = historyIndex - 1
    ctx.putImageData(history[newIndex].imageData, 0, 0)
    setHistoryIndex(newIndex)
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newIndex = historyIndex + 1
    ctx.putImageData(history[newIndex].imageData, 0, 0)
    setHistoryIndex(newIndex)
  }, [history, historyIndex])

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4
    const startR = data[startPos]
    const startG = data[startPos + 1]
    const startB = data[startPos + 2]

    // Parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16)
    const fillG = parseInt(fillColor.slice(3, 5), 16)
    const fillB = parseInt(fillColor.slice(5, 7), 16)

    if (startR === fillR && startG === fillG && startB === fillB) return

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue

      const pos = (y * canvas.width + x) * 4

      if (
        Math.abs(data[pos] - startR) > 10 ||
        Math.abs(data[pos + 1] - startG) > 10 ||
        Math.abs(data[pos + 2] - startB) > 10
      ) continue

      visited.add(key)

      data[pos] = fillR
      data[pos + 1] = fillG
      data[pos + 2] = fillB
      data[pos + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const eyedrop = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
    setColor(hex)
    setTool("pencil")
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e)

    if (tool === "fill") {
      floodFill(x, y, color)
      saveToHistory()
      return
    }

    if (tool === "eyedropper") {
      eyedrop(x, y)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (tool === "line" || tool === "rectangle" || tool === "circle") {
      setStartPoint({ x, y })
      setIsDrawing(true)
      return
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e)
    setCursorPos({ x: Math.round(x), y: Math.round(y) })

    if (!isDrawing) return

    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current
    if (!canvas || !tempCanvas) return

    const ctx = canvas.getContext("2d")
    const tempCtx = tempCanvas.getContext("2d")
    if (!ctx || !tempCtx) return

    if (tool === "pencil" || tool === "eraser") {
      ctx.lineTo(x, y)
      ctx.strokeStyle = tool === "eraser" ? secondaryColor : color
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
    } else if (startPoint && (tool === "line" || tool === "rectangle" || tool === "circle")) {
      // Clear temp canvas and redraw shape preview
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
      tempCtx.strokeStyle = color
      tempCtx.lineWidth = brushSize
      tempCtx.lineCap = "round"
      tempCtx.lineJoin = "round"

      if (tool === "line") {
        tempCtx.beginPath()
        tempCtx.moveTo(startPoint.x, startPoint.y)
        tempCtx.lineTo(x, y)
        tempCtx.stroke()
      } else if (tool === "rectangle") {
        const width = x - startPoint.x
        const height = y - startPoint.y
        tempCtx.strokeRect(startPoint.x, startPoint.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2))
        tempCtx.beginPath()
        tempCtx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
        tempCtx.stroke()
      }
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current
    if (!canvas || !tempCanvas) return

    const ctx = canvas.getContext("2d")
    const tempCtx = tempCanvas.getContext("2d")
    if (!ctx || !tempCtx) return

    if (startPoint && (tool === "line" || tool === "rectangle" || tool === "circle")) {
      const { x, y } = getCanvasCoords(e)

      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (tool === "line") {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else if (tool === "rectangle") {
        const width = x - startPoint.x
        const height = y - startPoint.y
        ctx.strokeRect(startPoint.x, startPoint.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2))
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
      setStartPoint(null)
    }

    setIsDrawing(false)
    saveToHistory()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = secondaryColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
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

    // Trigger download
    const link = document.createElement("a")
    link.download = fileName
    link.href = dataUrl
    link.click()
  }

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(25, Math.min(400, prev + delta)))
  }

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "pencil", icon: <Pencil className="w-4 h-4" />, label: "Lápiz" },
    { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Borrador" },
    { id: "line", icon: <Minus className="w-4 h-4" />, label: "Línea" },
    { id: "rectangle", icon: <Square className="w-4 h-4" />, label: "Rectángulo" },
    { id: "circle", icon: <Circle className="w-4 h-4" />, label: "Círculo" },
    { id: "fill", icon: <PaintBucket className="w-4 h-4" />, label: "Rellenar" },
    { id: "eyedropper", icon: <Pipette className="w-4 h-4" />, label: "Cuentagotas" },
  ]

  return (
    <div className="flex flex-col sm:flex-row h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-white/20">
      {/* Left Sidebar - Tools (hidden on mobile, shown at bottom) */}
      <div className="hidden sm:flex w-14 bg-zinc-900/80 border-r border-white/10 flex-col items-center py-3 gap-1">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
              tool === t.id
                ? "bg-white/20 text-white shadow-lg shadow-white/5"
                : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}

        <div className="w-8 h-px bg-white/10 my-2" />

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            historyIndex <= 0
              ? "text-zinc-600 cursor-not-allowed"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            historyIndex >= history.length - 1
              ? "text-zinc-600 cursor-not-allowed"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Toolbar */}
        <div className="h-auto sm:h-12 px-2 sm:px-4 py-2 sm:py-0 bg-zinc-900/50 border-b border-white/10 backdrop-blur-xl flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">Grosor:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 sm:w-20 accent-white"
            />
            <span className="text-xs text-zinc-300 w-8 text-center bg-zinc-800 rounded px-1.5 py-0.5">{brushSize}</span>
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/10" />

          {/* Color selectors */}
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Color primario"
              />
              <div
                className="w-full h-full rounded border-2 border-white/30 shadow-lg"
                style={{ backgroundColor: color }}
              />
            </div>
            <div className="relative w-5 h-5 sm:w-6 sm:h-6">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Color secundario"
              />
              <div
                className="w-full h-full rounded border border-white/20"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/10" />

          {/* Zoom - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleZoom(-25)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-300 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => handleZoom(25)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1" />

          {/* File name and actions */}
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="hidden sm:block px-3 py-1.5 text-sm bg-zinc-800/50 border border-white/10 rounded-md w-40 text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            onClick={clearCanvas}
            className="p-1.5 sm:p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
            title="Nuevo lienzo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Guardar</span>
          </button>
        </div>

        {/* Color Palette Bar */}
        <div className="h-8 sm:h-10 px-2 sm:px-4 bg-zinc-900/30 border-b border-white/5 flex items-center gap-0.5 sm:gap-1 overflow-x-auto flex-shrink-0">
          <span className="text-xs text-zinc-500 mr-1 sm:mr-2 hidden sm:inline">Paleta:</span>
          {COLOR_PALETTE.map((c, i) => (
            <button
              key={i}
              onClick={() => setColor(c)}
              onContextMenu={(e) => {
                e.preventDefault()
                setSecondaryColor(c)
              }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded transition-transform hover:scale-110 flex-shrink-0 ${
                color === c ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900" : ""
              }`}
              style={{ backgroundColor: c }}
              title={`${c} (clic derecho para secundario)`}
            />
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-zinc-800/50 flex items-center justify-center p-2 sm:p-6 min-h-0">
          <div
            className="relative shadow-2xl shadow-black/50"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={() => {
                setCursorPos(null)
                if (isDrawing) stopDrawing({ clientX: 0, clientY: 0 } as React.MouseEvent<HTMLCanvasElement>)
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>
                startDrawing(mouseEvent)
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>
                draw(mouseEvent)
              }}
              onTouchEnd={(e) => {
                stopDrawing({ clientX: 0, clientY: 0 } as React.MouseEvent<HTMLCanvasElement>)
              }}
              className="bg-white cursor-crosshair block touch-none"
              style={{
                cursor: tool === "eyedropper" ? "crosshair" :
                        tool === "fill" ? "cell" :
                        tool === "eraser" ? "cell" : "crosshair",
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            <canvas
              ref={tempCanvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="absolute inset-0 pointer-events-none"
            />
          </div>
        </div>

        {/* Mobile Tools Bar */}
        <div className="flex sm:hidden h-12 items-center gap-1 px-2 bg-zinc-900/80 border-t border-white/10 overflow-x-auto flex-shrink-0">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                tool === t.id
                  ? "bg-white/20 text-white"
                  : "text-zinc-400"
              }`}
            >
              {t.icon}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${
              historyIndex <= 0 ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${
              historyIndex >= history.length - 1 ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar - hidden on mobile */}
        <div className="hidden sm:flex h-7 items-center justify-between border-t border-white/10 bg-zinc-900/50 px-4 text-[10px] font-medium text-zinc-500 backdrop-blur-xl flex-shrink-0">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <Square className="w-3 h-3" />
              {canvasSize.width} × {canvasSize.height} px
            </span>
            <span className="flex items-center gap-1.5">
              <MousePointer2 className="w-3 h-3" />
              {cursorPos ? `${cursorPos.x}, ${cursorPos.y}` : "—"}
            </span>
            <span>
              Herramienta: {tools.find(t => t.id === tool)?.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: color }}
              />
              {color.toUpperCase()}
            </span>
            <span>{zoom}%</span>
            <span>Historial: {historyIndex + 1}/{history.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
