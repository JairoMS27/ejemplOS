'use client'

import { useState, useEffect } from 'react'

export function MenuBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-14 bg-black border-b border-white/20 flex items-center px-6 gap-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
          <span className="text-xs font-bold text-black">E</span>
        </div>
        <span className="text-sm font-semibold text-white">EjemplOS</span>
      </div>

      {/* Menu items */}
      <div className="flex-1 flex gap-8 text-sm text-white/60">
        <button className="hover:text-white transition-colors">Archivo</button>
        <button className="hover:text-white transition-colors">Editar</button>
        <button className="hover:text-white transition-colors">Ver</button>
      </div>

      {/* Status items */}
      <div className="flex items-center gap-4 text-sm text-white/60">
        <span>{time}</span>
      </div>
    </div>
  )
}
