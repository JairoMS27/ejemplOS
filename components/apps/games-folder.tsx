"use client"

import type React from "react"

import {
  Gamepad2,
  Bomb,
  Grid3x3,
  Hash,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  Clock,
  Star,
  Trophy,
} from "lucide-react"
import { useState } from "react"

interface GamesFolderProps {
  onOpenGame?: (gameType: "minesweeper" | "tetris" | "2048" | "snake") => void
  isMaximized?: boolean
}

export function GamesFolder({ onOpenGame, isMaximized }: GamesFolderProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const games = [
    { id: "minesweeper", name: "Buscaminas", Icon: Bomb, type: "minesweeper" as const, category: "Puzzle" },
    { id: "snake", name: "Snake", Icon: Gamepad2, type: "snake" as const, category: "Arcade" },
    { id: "tetris", name: "Tetris", Icon: Grid3x3, type: "tetris" as const, category: "Arcade" },
    { id: "2048", name: "2048", Icon: Hash, type: "2048" as const, category: "Puzzle" },
  ]

  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-white/20">
      {/* Toolbar */}
      <div className="flex h-12 items-center gap-4 border-b border-white/10 bg-zinc-900/50 px-4 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-1 text-zinc-400">
          <button className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
            disabled
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <span className="hover:text-white cursor-pointer transition-colors">EjemplOS</span>
          <span className="text-zinc-600">/</span>
          <span className="text-white">Juegos</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 rounded-md bg-zinc-800/50 px-3 py-1.5 border border-white/5 focus-within:border-white/20 focus-within:bg-zinc-800 transition-all">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar juegos"
            className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-24 sm:w-40"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-48 flex-col gap-1 border-r border-white/10 bg-zinc-900/30 p-3 md:flex backdrop-blur-md flex-shrink-0">
          <div className="mb-2 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Biblioteca</div>
          <SidebarItem icon={<Gamepad2 className="h-4 w-4" />} label="Todos los juegos" active />
          <SidebarItem icon={<Star className="h-4 w-4" />} label="Favoritos" />
          <SidebarItem icon={<Clock className="h-4 w-4" />} label="Recientes" />

          <div className="mt-4 mb-2 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Categorías</div>
          <SidebarItem icon={<LayoutGrid className="h-4 w-4" />} label="Arcade" />
          <SidebarItem icon={<Trophy className="h-4 w-4" />} label="Puzzle" />
          <SidebarItem icon={<Grid3x3 className="h-4 w-4" />} label="Estrategia" />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-black/20 p-4" onClick={() => setSelectedGame(null)}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 auto-rows-min">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedGame(game.id)
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  onOpenGame?.(game.type)
                }}
                className={`group flex flex-col items-center gap-2 rounded-lg p-4 transition-all cursor-default border ${
                  selectedGame === game.id
                    ? "bg-white/10 border-white/20 shadow-lg shadow-black/20"
                    : "hover:bg-white/5 border-transparent hover:border-white/5"
                }`}
              >
                <div className="relative p-2">
                  <game.Icon
                    className={`w-12 h-12 ${selectedGame === game.id ? "text-white" : "text-zinc-300 group-hover:text-white"} transition-colors`}
                  />
                </div>
                <div className="flex flex-col items-center text-center w-full">
                  <span
                    className={`text-xs font-medium truncate w-full px-1 rounded ${
                      selectedGame === game.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                    }`}
                  >
                    {game.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">{game.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex h-8 items-center justify-between border-t border-white/10 bg-zinc-900/50 px-4 text-[10px] font-medium text-zinc-500 backdrop-blur-xl flex-shrink-0">
        <div className="flex gap-4">
          <span>{games.length} juegos</span>
          {selectedGame && <span>1 seleccionado</span>}
        </div>
      </div>
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
