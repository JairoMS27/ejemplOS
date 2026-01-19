"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Save,
  Trash2,
  Eraser,
  Pencil,
  PaintBucket,
  Pipette,
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Plus,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  Upload,
  FolderOpen,
  Move,
  Type,
  Image as ImageIcon,
  Copy,
  Merge,
  X,
  Check,
  MousePointer2,
  Square
} from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  canvas: HTMLCanvasElement | null
  thumbnail: string
}

interface HistoryState {
  layers: {
    id: string
    name: string
    visible: boolean
    opacity: number
    imageData: ImageData | null
  }[]
  activeLayerId: string
}

type Tool = "brush" | "eraser" | "fill" | "eyedropper" | "move" | "text"

const COLOR_PALETTE = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#ff6600", "#6600ff", "#00ff66", "#ff0066",
  "#333333", "#666666", "#999999", "#cccccc", "#990000", "#009900",
  "#000099", "#999900", "#990099", "#009999", "#663300", "#336600",
]

export function ImageEditorWindow() {
  const { t } = useI18n()

  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const [layers, setLayers] = useState<Layer[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string>("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [secondaryColor, setSecondaryColor] = useState("#ffffff")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<Tool>("brush")
  const [zoom, setZoom] = useState(100)
  const [canvasSize] = useState({ width: 800, height: 600 })
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [fileName, setFileName] = useState("imagen.png")
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [savedImages, setSavedImages] = useState<{ name: string; dataUrl: string; date: string }[]>([])
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 })
  const [textValue, setTextValue] = useState("")
  const [fontSize, setFontSize] = useState(24)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const [moveStart, setMoveStart] = useState<{ x: number; y: number } | null>(null)
  const [layerOffset, setLayerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Create initial layer
  useEffect(() => {
    const initialLayer = createNewLayer(t.imageEditor?.backgroundLayer || "Fondo")
    setLayers([initialLayer])
    setActiveLayerId(initialLayer.id)
  }, [])

  // Load saved images from localStorage
  useEffect(() => {
    const images = JSON.parse(localStorage.getItem("paint_images") || "[]")
    setSavedImages(images)
  }, [showImportModal])

  // Focus text input when shown
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [showTextInput])

  const createNewLayer = (name?: string): Layer => {
    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const canvas = document.createElement("canvas")
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    return {
      id,
      name: name || `${t.imageEditor?.layer || "Capa"} ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      canvas,
      thumbnail: canvas.toDataURL()
    }
  }

  const updateLayerThumbnail = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId && layer.canvas) {
        return { ...layer, thumbnail: layer.canvas.toDataURL() }
      }
      return layer
    }))
  }, [])

  const renderComposite = useCallback(() => {
    const mainCanvas = mainCanvasRef.current
    if (!mainCanvas) return

    const ctx = mainCanvas.getContext("2d")
    if (!ctx) return

    // Clear main canvas with transparency
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)

    // Draw checkerboard pattern for transparency
    const patternSize = 10
    for (let x = 0; x < mainCanvas.width; x += patternSize) {
      for (let y = 0; y < mainCanvas.height; y += patternSize) {
        ctx.fillStyle = ((x + y) / patternSize) % 2 === 0 ? "#2a2a2a" : "#3a3a3a"
        ctx.fillRect(x, y, patternSize, patternSize)
      }
    }

    // Draw layers from bottom to top
    layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        ctx.globalAlpha = layer.opacity / 100
        ctx.drawImage(layer.canvas, 0, 0)
      }
    })
    ctx.globalAlpha = 1
  }, [layers])

  useEffect(() => {
    renderComposite()
  }, [layers, renderComposite])

  const saveToHistory = useCallback(() => {
    const state: HistoryState = {
      layers: layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        imageData: layer.canvas ? layer.canvas.getContext("2d")?.getImageData(0, 0, canvasSize.width, canvasSize.height) || null : null
      })),
      activeLayerId
    }

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(state)

    if (newHistory.length > 30) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [layers, activeLayerId, history, historyIndex, canvasSize])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return

    const prevState = history[historyIndex - 1]

    setLayers(prev => {
      return prevState.layers.map(savedLayer => {
        const existingLayer = prev.find(l => l.id === savedLayer.id)
        const canvas = existingLayer?.canvas || document.createElement("canvas")
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height

        if (savedLayer.imageData) {
          const ctx = canvas.getContext("2d")
          ctx?.putImageData(savedLayer.imageData, 0, 0)
        }

        return {
          id: savedLayer.id,
          name: savedLayer.name,
          visible: savedLayer.visible,
          opacity: savedLayer.opacity,
          canvas,
          thumbnail: canvas.toDataURL()
        }
      })
    })

    setActiveLayerId(prevState.activeLayerId)
    setHistoryIndex(historyIndex - 1)
  }, [history, historyIndex, canvasSize])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return

    const nextState = history[historyIndex + 1]

    setLayers(prev => {
      return nextState.layers.map(savedLayer => {
        const existingLayer = prev.find(l => l.id === savedLayer.id)
        const canvas = existingLayer?.canvas || document.createElement("canvas")
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height

        if (savedLayer.imageData) {
          const ctx = canvas.getContext("2d")
          ctx?.putImageData(savedLayer.imageData, 0, 0)
        }

        return {
          id: savedLayer.id,
          name: savedLayer.name,
          visible: savedLayer.visible,
          opacity: savedLayer.opacity,
          canvas,
          thumbnail: canvas.toDataURL()
        }
      })
    })

    setActiveLayerId(nextState.activeLayerId)
    setHistoryIndex(historyIndex + 1)
  }, [history, historyIndex, canvasSize])

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const getActiveLayer = () => layers.find(l => l.id === activeLayerId)

  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const activeLayer = getActiveLayer()
    if (!activeLayer?.canvas) return

    const ctx = activeLayer.canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height)
    const data = imageData.data

    const startPos = (Math.floor(startY) * canvasSize.width + Math.floor(startX)) * 4
    const startR = data[startPos]
    const startG = data[startPos + 1]
    const startB = data[startPos + 2]
    const startA = data[startPos + 3]

    const fillR = parseInt(fillColor.slice(1, 3), 16)
    const fillG = parseInt(fillColor.slice(3, 5), 16)
    const fillB = parseInt(fillColor.slice(5, 7), 16)

    if (startR === fillR && startG === fillG && startB === fillB && startA === 255) return

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if (x < 0 || x >= canvasSize.width || y < 0 || y >= canvasSize.height) continue

      const pos = (y * canvasSize.width + x) * 4

      if (
        Math.abs(data[pos] - startR) > 10 ||
        Math.abs(data[pos + 1] - startG) > 10 ||
        Math.abs(data[pos + 2] - startB) > 10 ||
        Math.abs(data[pos + 3] - startA) > 10
      ) continue

      visited.add(key)

      data[pos] = fillR
      data[pos + 1] = fillG
      data[pos + 2] = fillB
      data[pos + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
    updateLayerThumbnail(activeLayerId)
    renderComposite()
  }

  const eyedrop = (x: number, y: number) => {
    const mainCanvas = mainCanvasRef.current
    if (!mainCanvas) return

    const ctx = mainCanvas.getContext("2d")
    if (!ctx) return

    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
    setColor(hex)
    setTool("brush")
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e)
    const activeLayer = getActiveLayer()

    if (!activeLayer?.canvas || !activeLayer.visible) return

    if (tool === "fill") {
      floodFill(x, y, color)
      saveToHistory()
      return
    }

    if (tool === "eyedropper") {
      eyedrop(x, y)
      return
    }

    if (tool === "text") {
      setTextInputPos({ x, y })
      setTextValue("")
      setShowTextInput(true)
      return
    }

    if (tool === "move") {
      setMoveStart({ x, y })
      setLayerOffset({ x: 0, y: 0 })
      setIsDrawing(true)
      return
    }

    const ctx = activeLayer.canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,0)" : color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
    } else {
      ctx.globalCompositeOperation = "source-over"
    }

    setLastPoint({ x, y })
    setIsDrawing(true)

    // Draw initial dot
    ctx.beginPath()
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
    }
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"

    renderComposite()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e)
    setCursorPos({ x: Math.round(x), y: Math.round(y) })

    if (!isDrawing) return

    const activeLayer = getActiveLayer()
    if (!activeLayer?.canvas || !activeLayer.visible) return

    // Handle move tool
    if (tool === "move" && moveStart) {
      const offsetX = x - moveStart.x
      const offsetY = y - moveStart.y
      setLayerOffset({ x: offsetX, y: offsetY })

      // Re-render with offset preview
      const mainCanvas = mainCanvasRef.current
      if (!mainCanvas) return
      const mainCtx = mainCanvas.getContext("2d")
      if (!mainCtx) return

      // Clear and draw checkerboard
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
      const patternSize = 10
      for (let px = 0; px < mainCanvas.width; px += patternSize) {
        for (let py = 0; py < mainCanvas.height; py += patternSize) {
          mainCtx.fillStyle = ((px + py) / patternSize) % 2 === 0 ? "#2a2a2a" : "#3a3a3a"
          mainCtx.fillRect(px, py, patternSize, patternSize)
        }
      }

      // Draw layers with offset for active layer
      layers.forEach(layer => {
        if (layer.visible && layer.canvas) {
          mainCtx.globalAlpha = layer.opacity / 100
          if (layer.id === activeLayerId) {
            mainCtx.drawImage(layer.canvas, offsetX, offsetY)
          } else {
            mainCtx.drawImage(layer.canvas, 0, 0)
          }
        }
      })
      mainCtx.globalAlpha = 1
      return
    }

    if (!lastPoint) return

    const ctx = activeLayer.canvas.getContext("2d")
    if (!ctx) return

    if (tool === "brush" || tool === "eraser") {
      ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,0)" : color
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
      } else {
        ctx.globalCompositeOperation = "source-over"
      }

      drawLine(ctx, lastPoint.x, lastPoint.y, x, y)
      ctx.globalCompositeOperation = "source-over"

      setLastPoint({ x, y })
      renderComposite()
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      // Apply move if using move tool
      if (tool === "move" && moveStart && (layerOffset.x !== 0 || layerOffset.y !== 0)) {
        const activeLayer = getActiveLayer()
        if (activeLayer?.canvas) {
          const ctx = activeLayer.canvas.getContext("2d")
          if (ctx) {
            // Create temp canvas with current content
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = canvasSize.width
            tempCanvas.height = canvasSize.height
            const tempCtx = tempCanvas.getContext("2d")
            if (tempCtx) {
              tempCtx.drawImage(activeLayer.canvas, 0, 0)
              // Clear and redraw with offset
              ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
              ctx.drawImage(tempCanvas, layerOffset.x, layerOffset.y)
            }
          }
        }
        setMoveStart(null)
        setLayerOffset({ x: 0, y: 0 })
      }

      setIsDrawing(false)
      setLastPoint(null)
      updateLayerThumbnail(activeLayerId)
      saveToHistory()
      renderComposite()
    }
  }

  const handleTextSubmit = () => {
    if (!textValue.trim()) {
      setShowTextInput(false)
      return
    }

    const activeLayer = getActiveLayer()
    if (!activeLayer?.canvas) {
      setShowTextInput(false)
      return
    }

    const ctx = activeLayer.canvas.getContext("2d")
    if (!ctx) {
      setShowTextInput(false)
      return
    }

    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.fillText(textValue, textInputPos.x, textInputPos.y)

    updateLayerThumbnail(activeLayerId)
    renderComposite()
    saveToHistory()
    setShowTextInput(false)
    setTextValue("")
  }

  const addLayer = () => {
    const newLayer = createNewLayer()
    setLayers(prev => [...prev, newLayer])
    setActiveLayerId(newLayer.id)
    saveToHistory()
  }

  const deleteLayer = (layerId: string) => {
    if (layers.length <= 1) return

    setLayers(prev => {
      const filtered = prev.filter(l => l.id !== layerId)
      if (layerId === activeLayerId && filtered.length > 0) {
        setActiveLayerId(filtered[filtered.length - 1].id)
      }
      return filtered
    })
    saveToHistory()
  }

  const duplicateLayer = (layerId: string) => {
    const sourceLayer = layers.find(l => l.id === layerId)
    if (!sourceLayer?.canvas) return

    const newLayer = createNewLayer(`${sourceLayer.name} (${t.imageEditor?.copy || "copia"})`)
    const ctx = newLayer.canvas?.getContext("2d")
    if (ctx && newLayer.canvas) {
      ctx.drawImage(sourceLayer.canvas, 0, 0)
      newLayer.thumbnail = newLayer.canvas.toDataURL()
    }

    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId)
      const newLayers = [...prev]
      newLayers.splice(index + 1, 0, newLayer)
      return newLayers
    })
    setActiveLayerId(newLayer.id)
    saveToHistory()
  }

  const moveLayer = (layerId: string, direction: "up" | "down") => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId)
      if (direction === "up" && index < prev.length - 1) {
        const newLayers = [...prev]
        ;[newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]]
        return newLayers
      }
      if (direction === "down" && index > 0) {
        const newLayers = [...prev]
        ;[newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]]
        return newLayers
      }
      return prev
    })
    saveToHistory()
  }

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(l =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ))
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(l =>
      l.id === layerId ? { ...l, opacity } : l
    ))
  }

  const mergeDown = (layerId: string) => {
    const index = layers.findIndex(l => l.id === layerId)
    if (index <= 0) return

    const topLayer = layers[index]
    const bottomLayer = layers[index - 1]

    if (!topLayer.canvas || !bottomLayer.canvas) return

    const ctx = bottomLayer.canvas.getContext("2d")
    if (!ctx) return

    ctx.globalAlpha = topLayer.opacity / 100
    ctx.drawImage(topLayer.canvas, 0, 0)
    ctx.globalAlpha = 1

    bottomLayer.thumbnail = bottomLayer.canvas.toDataURL()

    setLayers(prev => prev.filter(l => l.id !== layerId))
    setActiveLayerId(bottomLayer.id)
    saveToHistory()
  }

  const importImage = (imageUrl: string, asNewLayer: boolean = true) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (asNewLayer) {
        const newLayer = createNewLayer(t.imageEditor?.importedImage || "Imagen importada")
        const ctx = newLayer.canvas?.getContext("2d")
        if (ctx && newLayer.canvas) {
          // Scale image to fit canvas while maintaining aspect ratio
          const scale = Math.min(
            canvasSize.width / img.width,
            canvasSize.height / img.height,
            1
          )
          const width = img.width * scale
          const height = img.height * scale
          const x = (canvasSize.width - width) / 2
          const y = (canvasSize.height - height) / 2

          ctx.drawImage(img, x, y, width, height)
          newLayer.thumbnail = newLayer.canvas.toDataURL()
        }
        setLayers(prev => [...prev, newLayer])
        setActiveLayerId(newLayer.id)
      } else {
        const activeLayer = getActiveLayer()
        if (activeLayer?.canvas) {
          const ctx = activeLayer.canvas.getContext("2d")
          if (ctx) {
            const scale = Math.min(
              canvasSize.width / img.width,
              canvasSize.height / img.height,
              1
            )
            const width = img.width * scale
            const height = img.height * scale
            const x = (canvasSize.width - width) / 2
            const y = (canvasSize.height - height) / 2

            ctx.drawImage(img, x, y, width, height)
            updateLayerThumbnail(activeLayerId)
          }
        }
      }
      renderComposite()
      saveToHistory()
      setShowImportModal(false)
    }
    img.src = imageUrl
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      importImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const exportImage = () => {
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = canvasSize.width
    exportCanvas.height = canvasSize.height
    const ctx = exportCanvas.getContext("2d")
    if (!ctx) return

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // Draw all visible layers
    layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        ctx.globalAlpha = layer.opacity / 100
        ctx.drawImage(layer.canvas, 0, 0)
      }
    })
    ctx.globalAlpha = 1

    const dataUrl = exportCanvas.toDataURL("image/png")

    // Save to localStorage for Finder
    const images = JSON.parse(localStorage.getItem("paint_images") || "[]")
    const newImage = {
      name: fileName,
      date: new Date().toISOString(),
      dataUrl
    }
    localStorage.setItem("paint_images", JSON.stringify([...images, newImage]))

    // Download
    const link = document.createElement("a")
    link.download = fileName
    link.href = dataUrl
    link.click()
  }

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(25, Math.min(400, prev + delta)))
  }

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "move", icon: <Move className="w-4 h-4" />, label: t.imageEditor?.tools?.move || "Mover" },
    { id: "brush", icon: <Pencil className="w-4 h-4" />, label: t.imageEditor?.tools?.brush || "Pincel" },
    { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: t.imageEditor?.tools?.eraser || "Borrador" },
    { id: "fill", icon: <PaintBucket className="w-4 h-4" />, label: t.imageEditor?.tools?.fill || "Rellenar" },
    { id: "eyedropper", icon: <Pipette className="w-4 h-4" />, label: t.imageEditor?.tools?.eyedropper || "Cuentagotas" },
    { id: "text", icon: <Type className="w-4 h-4" />, label: t.imageEditor?.tools?.text || "Texto" },
  ]

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-white/20">
      {/* Left Sidebar - Tools */}
      <div className="hidden sm:flex w-14 bg-zinc-900/80 border-r border-white/10 flex-col items-center py-3 gap-1 flex-shrink-0">
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

        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            historyIndex <= 0
              ? "text-zinc-600 cursor-not-allowed"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
          title={t.imageEditor?.undo || "Deshacer"}
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
          title={t.imageEditor?.redo || "Rehacer"}
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Top Toolbar */}
        <div className="h-auto sm:h-12 px-2 sm:px-4 py-2 sm:py-0 bg-zinc-900/50 border-b border-white/10 backdrop-blur-xl flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">{t.imageEditor?.size || "Tamaño"}:</span>
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
                title={t.imageEditor?.primaryColor || "Color primario"}
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
                title={t.imageEditor?.secondaryColor || "Color secundario"}
              />
              <div
                className="w-full h-full rounded border border-white/20"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/10" />

          {/* Font Size (for text tool) */}
          {tool === "text" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-400">{t.imageEditor?.fontSize || "Fuente"}:</span>
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-14 px-2 py-1 text-xs bg-zinc-800 border border-white/10 rounded text-white"
                />
              </div>
              <div className="hidden sm:block h-6 w-px bg-white/10" />
            </>
          )}

          {/* Zoom */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleZoom(-25)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title={t.imageEditor?.zoomOut || "Alejar"}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-300 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => handleZoom(25)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title={t.imageEditor?.zoomIn || "Acercar"}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1" />

          {/* Import button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-xs sm:text-sm border border-white/10"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{t.imageEditor?.import || "Importar"}</span>
          </button>

          {/* File name */}
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="hidden sm:block px-3 py-1.5 text-sm bg-zinc-800/50 border border-white/10 rounded-md w-32 text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
          />

          {/* Export button */}
          <button
            onClick={exportImage}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t.imageEditor?.export || "Exportar"}</span>
          </button>
        </div>

        {/* Color Palette Bar */}
        <div className="h-8 sm:h-10 px-2 sm:px-4 bg-zinc-900/30 border-b border-white/5 flex items-center gap-0.5 sm:gap-1 overflow-x-auto flex-shrink-0">
          <span className="text-xs text-zinc-500 mr-1 sm:mr-2 hidden sm:inline">{t.imageEditor?.palette || "Paleta"}:</span>
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
              title={`${c}`}
            />
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-zinc-800/50 flex items-center justify-center p-2 sm:p-6 min-h-0 relative">
          <div
            className="relative shadow-2xl shadow-black/50"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <canvas
              ref={mainCanvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={() => {
                setCursorPos(null)
                stopDrawing()
              }}
              className="cursor-crosshair block touch-none"
              style={{
                cursor: tool === "eyedropper" ? "crosshair" :
                        tool === "fill" ? "cell" :
                        tool === "text" ? "text" :
                        tool === "move" ? "move" :
                        tool === "eraser" ? "cell" : "crosshair"
              }}
            />

            {/* Text Input Overlay */}
            {showTextInput && (
              <div
                className="absolute flex items-center gap-1"
                style={{
                  left: textInputPos.x,
                  top: textInputPos.y - fontSize / 2,
                }}
              >
                <input
                  ref={textInputRef}
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTextSubmit()
                    if (e.key === "Escape") setShowTextInput(false)
                  }}
                  className="px-2 py-1 bg-black/80 border border-white/30 rounded text-white outline-none"
                  style={{ fontSize: `${fontSize}px`, color }}
                  placeholder={t.imageEditor?.enterText || "Escribe..."}
                />
                <button
                  onClick={handleTextSubmit}
                  className="p-1 bg-green-600 hover:bg-green-500 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowTextInput(false)}
                  className="p-1 bg-red-600 hover:bg-red-500 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
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

        {/* Status Bar */}
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
              {t.imageEditor?.tool || "Herramienta"}: {tools.find(t => t.id === tool)?.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              {layers.length} {t.imageEditor?.layers || "capas"}
            </span>
            <span>{zoom}%</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Layers */}
      <div className="hidden md:flex w-56 bg-zinc-900/80 border-l border-white/10 flex-col flex-shrink-0">
        {/* Layers Header */}
        <div className="h-10 px-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {t.imageEditor?.layers || "Capas"}
          </span>
          <button
            onClick={addLayer}
            className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
            title={t.imageEditor?.addLayer || "Añadir capa"}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Layers List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[...layers].reverse().map((layer, idx) => (
            <div
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`group p-2 rounded-lg cursor-pointer transition-all ${
                layer.id === activeLayerId
                  ? "bg-white/15 ring-1 ring-white/20"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded border border-white/10 overflow-hidden flex-shrink-0 bg-zinc-800">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${layer.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-200 truncate">{layer.name}</div>
                  <div className="text-[10px] text-zinc-500">{layer.opacity}%</div>
                </div>

                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerVisibility(layer.id)
                  }}
                  className={`p-1 rounded transition-colors ${
                    layer.visible ? "text-zinc-300 hover:text-white" : "text-zinc-600"
                  }`}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Layer Controls - show when active */}
              {layer.id === activeLayerId && (
                <div className="mt-2 space-y-2">
                  {/* Opacity Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">{t.imageEditor?.opacity || "Opacidad"}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        updateLayerOpacity(layer.id, val)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-14 px-2 py-0.5 text-xs bg-zinc-800 border border-white/10 rounded text-white text-center"
                    />
                    <span className="text-[10px] text-zinc-500">%</span>
                  </div>

                  {/* Layer Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, "up")
                      }}
                      disabled={idx === 0}
                      className={`p-1 rounded transition-colors ${
                        idx === 0 ? "text-zinc-700" : "text-zinc-400 hover:bg-white/10 hover:text-white"
                      }`}
                      title={t.imageEditor?.moveUp || "Mover arriba"}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, "down")
                      }}
                      disabled={idx === layers.length - 1}
                      className={`p-1 rounded transition-colors ${
                        idx === layers.length - 1 ? "text-zinc-700" : "text-zinc-400 hover:bg-white/10 hover:text-white"
                      }`}
                      title={t.imageEditor?.moveDown || "Mover abajo"}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateLayer(layer.id)
                      }}
                      className="p-1 rounded text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                      title={t.imageEditor?.duplicate || "Duplicar"}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        mergeDown(layer.id)
                      }}
                      disabled={layers.indexOf(layer) === 0}
                      className={`p-1 rounded transition-colors ${
                        layers.indexOf(layer) === 0 ? "text-zinc-700" : "text-zinc-400 hover:bg-white/10 hover:text-white"
                      }`}
                      title={t.imageEditor?.mergeDown || "Fusionar abajo"}
                    >
                      <Merge className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteLayer(layer.id)
                      }}
                      disabled={layers.length <= 1}
                      className={`p-1 rounded transition-colors ${
                        layers.length <= 1 ? "text-zinc-700" : "text-red-400 hover:bg-red-500/20"
                      }`}
                      title={t.imageEditor?.delete || "Eliminar"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-[90%] max-w-lg max-h-[80%] flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t.imageEditor?.importImage || "Importar imagen"}
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Upload from PC */}
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2">{t.imageEditor?.fromComputer || "Desde tu ordenador"}</h4>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors flex flex-col items-center gap-2 text-zinc-400 hover:text-white"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">{t.imageEditor?.clickToUpload || "Haz clic para seleccionar"}</span>
                </button>
              </div>

              {/* Saved Images */}
              {savedImages.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-zinc-400 mb-2">{t.imageEditor?.savedImages || "Imagenes guardadas"}</h4>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {savedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => importImage(img.dataUrl)}
                        className="aspect-square rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-colors group relative"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white truncate px-1">{img.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
