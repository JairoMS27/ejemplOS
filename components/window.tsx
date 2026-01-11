'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Maximize, Minimize, X, Move } from 'lucide-react'

interface WindowProps {
  id: string
  title: string
  zIndex: number
  isMaximized?: boolean
  isMinimized?: boolean
  onClose: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  onFocus: () => void
  children: React.ReactNode
  savedSize?: { width: number; height: number }
  savedPosition?: { x: number; y: number }
  onSizeChange?: (size: { width: number; height: number }) => void
  onPositionChange?: (position: { x: number; y: number }) => void
}

export function Window({ 
  id, 
  title, 
  zIndex, 
  isMaximized = false,
  isMinimized = false,
  onClose, 
  onMinimize,
  onMaximize,
  onFocus,
  savedSize,
  savedPosition,
  onSizeChange,
  onPositionChange,
  children 
}: WindowProps) {
  const [size, setSize] = useState(savedSize || { width: 900, height: 600 })
  const [position, setPosition] = useState(savedPosition || { x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (savedSize && (savedSize.width !== size.width || savedSize.height !== size.height)) {
      setSize(savedSize)
    }
  }, [savedSize?.width, savedSize?.height])

  useEffect(() => {
    if (savedPosition && (savedPosition.x !== position.x || savedPosition.y !== position.y)) {
      setPosition(savedPosition)
    }
  }, [savedPosition?.x, savedPosition?.y])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: Math.max(0, e.clientY - dragOffset.y),
        }
        setPosition(newPosition)
        onPositionChange?.(newPosition)
      }

      if (isResizing && !isMaximized) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        let newWidth = size.width
        let newHeight = size.height
        let newX = position.x
        let newY = position.y

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(400, resizeStart.width + deltaX)
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(400, resizeStart.width - deltaX)
          newX = position.x + (size.width - newWidth)
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(300, resizeStart.height + deltaY)
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(300, resizeStart.height - deltaY)
          newY = position.y + (size.height - newHeight)
        }

        const newSize = { width: newWidth, height: newHeight }
        const newPosition = { x: newX, y: newY }
        
        setSize(newSize)
        setPosition(newPosition)
        onSizeChange?.(newSize)
        onPositionChange?.(newPosition)
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection('')
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeDirection, isMaximized, size, position])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    if (isMaximized) return
    
    onFocus()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (isMaximized) return
    e.stopPropagation()
    onFocus()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
  }

  const getResizeCursor = (direction: string) => {
    const cursors: Record<string, string> = {
      n: 'cursor-ns-resize',
      s: 'cursor-ns-resize',
      e: 'cursor-ew-resize',
      w: 'cursor-ew-resize',
      ne: 'cursor-nesw-resize',
      nw: 'cursor-nwse-resize',
      se: 'cursor-nwse-resize',
      sw: 'cursor-nesw-resize',
    }
    return cursors[direction] || ''
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={windowRef}
          style={{
            display: isMinimized ? 'none' : 'block',
            position: 'fixed',
            left: isMaximized ? '0' : `${position.x}px`,
            top: isMaximized ? '0' : `${position.y}px`,
            width: isMaximized ? '100vw' : `${size.width}px`,
            height: isMaximized ? 'calc(100vh - 64px)' : `${size.height}px`,
            zIndex,
          }}
          className={`max-w-screen animate-window-open select-none ${isMaximized ? 'rounded-none' : ''}`}
        >
          {/* Title bar */}
          <div
            onMouseDown={handleMouseDown}
            className={`h-10 bg-gray-100 border border-black/20 ${isMaximized ? 'rounded-none' : 'rounded-t-xl'} flex items-center justify-between px-4 cursor-move hover:bg-gray-50 transition-colors select-none`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  title="Cerrar"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMinimize?.()
                  }}
                  className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                  title="Minimizar"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMaximize?.()
                  }}
                  className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                  title={isMaximized ? "Restaurar" : "Maximizar"}
                />
              </div>
              <span className="text-sm font-medium text-black/70">{title}</span>
            </div>
          </div>

          {/* Content */}
          <div
            data-no-drag
            className={`bg-white border border-t-0 border-black/20 ${isMaximized ? 'rounded-none h-full' : 'rounded-b-xl'} overflow-hidden shadow-lg relative select-none`}
            style={{ height: isMaximized ? 'calc(100% - 40px)' : `${size.height - 40}px` }}
          >
            {children}

            {!isMaximized && (
              <>
                {/* Bordes */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'n')}
                  className="absolute top-0 left-0 right-0 h-1 hover:bg-blue-500/20"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, 's')}
                  className="absolute bottom-0 left-0 right-0 h-1 hover:bg-blue-500/20"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'e')}
                  className="absolute top-0 right-0 bottom-0 w-1 hover:bg-blue-500/20"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'w')}
                  className="absolute top-0 left-0 bottom-0 w-1 hover:bg-blue-500/20"
                />
                
                {/* Esquinas */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  className="absolute top-0 left-0 w-3 h-3 hover:bg-blue-500/30"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'ne')}
                  className="absolute top-0 right-0 w-3 h-3 hover:bg-blue-500/30"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'sw')}
                  className="absolute bottom-0 left-0 w-3 h-3 hover:bg-blue-500/30"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                  className="absolute bottom-0 right-0 w-3 h-3 hover:bg-blue-500/30"
                />
              </>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      
      {/* Context Menu */}
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onMaximize}>
          <Maximize className="mr-2 h-4 w-4" />
          {isMaximized ? 'Restaurar' : 'Maximizar'}
        </ContextMenuItem>
        <ContextMenuItem onClick={onMinimize}>
          <Minimize className="mr-2 h-4 w-4" />
          Minimizar
        </ContextMenuItem>
        <ContextMenuItem onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cerrar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
