"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { LucideIcon } from "lucide-react"

interface DesktopIconProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  label: string
  onDoubleClick?: () => void
  initialPosition: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
  isMobile?: boolean
}

export function DesktopIcon({
  icon: Icon,
  label,
  onDoubleClick,
  initialPosition,
  onPositionChange,
  selected,
  onClick,
  isMobile = false,
}: DesktopIconProps) {
  const [isDragging, setIsDragging] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const dragOffset = useRef({ x: 0, y: 0 })
  const lastTapRef = useRef<number>(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onClick?.(e)

      // En móvil no permitimos drag
      if (isMobile) return

      if (e.detail === 1) {
        setIsDragging(true)
        dragStartPos.current = { x: e.clientX, y: e.clientY }
        dragOffset.current = { x: 0, y: 0 }
        e.preventDefault()

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - dragStartPos.current.x
          const deltaY = moveEvent.clientY - dragStartPos.current.y
          dragOffset.current = { x: deltaX, y: deltaY }

          // Manipular el DOM directamente para un movimiento suave sin re-renders
          if (iconRef.current) {
            iconRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`
          }
        }

        const handleMouseUp = (upEvent: MouseEvent) => {
          window.removeEventListener("mousemove", handleMouseMove)
          window.removeEventListener("mouseup", handleMouseUp)

          const deltaX = upEvent.clientX - dragStartPos.current.x
          const deltaY = upEvent.clientY - dragStartPos.current.y
          const finalPosition = {
            x: initialPosition.x + deltaX,
            y: initialPosition.y + deltaY,
          }

          // Resetear el transform antes de actualizar la posición
          if (iconRef.current) {
            iconRef.current.style.transform = "none"
          }

          dragOffset.current = { x: 0, y: 0 }
          setIsDragging(false)
          onPositionChange(finalPosition)
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)
      }
    },
    [onClick, initialPosition, onPositionChange, isMobile],
  )

  // Handler para tap en móvil (doble tap para abrir)
  const handleTap = useCallback(() => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Doble tap - abrir
      onDoubleClick?.()
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }, [onDoubleClick])

  // En móvil usamos posición relativa (para el grid)
  if (isMobile) {
    return (
      <div
        ref={iconRef}
        className="flex flex-col items-center gap-1 cursor-pointer select-none group transition-all active:scale-95"
        onClick={(e) => {
          onClick?.(e)
          handleTap()
        }}
      >
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-xl border transition-all duration-200 ${
            selected
              ? "bg-white/20 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              : "bg-white/5 border-white/10"
          }`}
        >
          <Icon
            className={`w-8 h-8 transition-transform duration-200 ${selected ? "scale-110 text-white" : "text-zinc-300"}`}
          />
        </div>
        <span
          className={`text-[10px] text-center leading-tight px-1 py-0.5 rounded transition-colors max-w-full truncate ${
            selected
              ? "bg-blue-600/80 text-white font-medium shadow-sm"
              : "text-zinc-300"
          }`}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
        >
          {label}
        </span>
      </div>
    )
  }

  // Desktop: posición absoluta con drag
  return (
    <div
      ref={iconRef}
      className={`absolute flex flex-col items-center gap-1 cursor-pointer select-none w-24 group ${
        isDragging ? "z-50" : "z-0"
      }`}
      style={{
        left: `${initialPosition.x}px`,
        top: `${initialPosition.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={`w-16 h-16 flex items-center justify-center rounded-xl border transition-all duration-200 ${
          selected
            ? "bg-white/20 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            : "bg-transparent border-transparent group-hover:bg-white/5 group-hover:border-white/10"
        }`}
      >
        <Icon
          className={`w-10 h-10 transition-transform duration-200 ${selected ? "scale-110 text-white" : "text-zinc-300 group-hover:scale-105 group-hover:text-white"}`}
        />
      </div>
      <span
        className={`text-xs text-center leading-tight px-2 py-1 rounded-md transition-colors max-w-full truncate ${
          selected
            ? "bg-blue-600/80 text-white font-medium shadow-sm"
            : "text-zinc-300 group-hover:text-white bg-black/0 group-hover:bg-black/40"
        }`}
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {label}
      </span>
    </div>
  )
}
