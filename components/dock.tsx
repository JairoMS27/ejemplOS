'use client'

import { Globe, Grid3x3, Gamepad2 } from 'lucide-react'

interface DockProps {
  onAppClick: (app: 'browser' | 'minesweeper' | 'finder') => void
}

export function Dock({ onAppClick }: DockProps) {
  const apps = [
    { id: 'browser', icon: Globe, label: 'Navegador', type: 'browser' as const },
    { id: 'finder', icon: Grid3x3, label: 'Finder', type: 'finder' as const },
    { id: 'minesweeper', icon: Gamepad2, label: 'Buscaminas', type: 'minesweeper' as const },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/95 border-t border-white/20 flex items-center justify-center gap-6">
      {apps.map(app => {
        const Icon = app.icon
        return (
          <button
            key={app.id}
            onClick={() => onAppClick(app.type)}
            className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-all hover:scale-110 cursor-pointer"
            title={app.label}
          >
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/20 group-hover:border-white/40">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white group-hover:text-white transition-colors">{app.label}</span>
          </button>
        )
      })}
    </div>
  )
}
