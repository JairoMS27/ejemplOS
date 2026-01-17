"use client"

import type React from "react"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Folder,
  Star,
  Clock,
  Puzzle,
  Key,
  HelpCircle,
  Rocket,
  Home,
  FolderOpen,
  Gamepad2,
  Wrench,
  Sparkles,
  LayoutGrid,
  FileText,
  Download,
  ImageIcon,
  Music,
  Monitor,
} from "lucide-react"

interface ProjectItem {
  id: string
  name: string
  Icon: React.ComponentType<{ className?: string }> | ((props: { className?: string }) => React.ReactElement)
  url: string
  category: "Juego" | "Herramienta" | "Evento" | "IA"
  favorite?: boolean
  recent?: boolean
}

interface ProjectsFolderProps {
  onOpenProject?: (url: string) => void
  onOpenFinder?: (path?: string) => void
  onOpenApp?: (appType: "ejpod" | "settings" | "games") => void
  isMaximized?: boolean
}

export function ProjectsFolder({ onOpenProject, onOpenFinder, onOpenApp, isMaximized }: ProjectsFolderProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState("Todos")
  const [history, setHistory] = useState<string[]>(["Todos"])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  const projects: ProjectItem[] = [
    {
      id: "puzzlecraft",
      name: "Puzzlecraft",
      Icon: Puzzle,
      url: "https://puzzlescraft.vercel.app/",
      category: "Juego",
      favorite: true,
      recent: true,
    },
    {
      id: "json-viewer",
      name: "JSON Viewer",
      Icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
          <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
        </svg>
      ),
      url: "https://json-viewers.vercel.app/",
      category: "Herramienta",
      favorite: true,
      recent: true,
    },
    {
      id: "vibe-code-jam",
      name: "Vibe Code Jam",
      Icon: Rocket,
      url: "https://vibecodingjam.netlify.app/",
      category: "Evento",
      recent: true,
    },
    {
      id: "api-key-checker",
      name: "Who's Using Your API Key?",
      Icon: Key,
      url: "https://whosusingyourapikey.vercel.app/",
      category: "Herramienta",
    },
    {
      id: "llm-match",
      name: "LLM Match",
      Icon: HelpCircle,
      url: "https://llmatch.vercel.app/",
      category: "IA",
      favorite: true,
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Juego":
        return <Gamepad2 className="h-4 w-4" />
      case "Herramienta":
        return <Wrench className="h-4 w-4" />
      case "Evento":
        return <Rocket className="h-4 w-4" />
      case "IA":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Folder className="h-4 w-4" />
    }
  }

  const getFilteredProjects = () => {
    let filtered = projects

    // Filter by category/view
    switch (currentPath) {
      case "Favoritos":
        filtered = projects.filter(p => p.favorite)
        break
      case "Recientes":
        filtered = projects.filter(p => p.recent)
        break
      case "Juegos":
        filtered = projects.filter(p => p.category === "Juego")
        break
      case "Herramientas":
        filtered = projects.filter(p => p.category === "Herramienta")
        break
      case "IA":
        filtered = projects.filter(p => p.category === "IA")
        break
      case "Eventos":
        filtered = projects.filter(p => p.category === "Evento")
        break
      default:
        filtered = projects
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const currentProjects = getFilteredProjects()

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(path)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCurrentPath(path)
    setSelectedProject(null)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCurrentPath(history[historyIndex - 1])
      setSelectedProject(null)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCurrentPath(history[historyIndex + 1])
      setSelectedProject(null)
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-white/20">
      {/* Toolbar */}
      <div className="flex h-12 items-center gap-2 sm:gap-4 border-b border-white/10 bg-zinc-900/50 px-2 sm:px-4 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex === history.length - 1}
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-zinc-400 min-w-0">
          <span className="hover:text-white cursor-pointer transition-colors hidden sm:inline">
            EjemplOS
          </span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="hover:text-white cursor-pointer transition-colors hidden sm:inline">
            Escritorio
          </span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="text-white hidden sm:inline">
            Mis Proyectos
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 rounded-md bg-zinc-800/50 px-2 sm:px-3 py-1.5 border border-white/5 focus-within:border-white/20 focus-within:bg-zinc-800 transition-all">
          <Search className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-16 sm:w-40"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-48 flex-col gap-1 border-r border-white/10 bg-zinc-900/30 p-3 md:flex backdrop-blur-md flex-shrink-0">
          <div className="mb-2 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Favoritos</div>
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Todos"
            active={currentPath === "Todos"}
            onClick={() => navigateTo("Todos")}
          />
          <SidebarItem
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Aplicaciones"
            active={false}
            onClick={() => onOpenFinder?.("Aplicaciones")}
          />

          <div className="mt-4 mb-2 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ubicaciones</div>
          <SidebarItem
            icon={<Monitor className="h-4 w-4" />}
            label="Escritorio"
            active={false}
            onClick={() => onOpenFinder?.("Escritorio")}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Documentos"
            active={false}
            onClick={() => onOpenFinder?.("Documentos")}
          />
          <SidebarItem
            icon={<Download className="h-4 w-4" />}
            label="Descargas"
            active={false}
            onClick={() => onOpenFinder?.("Descargas")}
          />
          <SidebarItem
            icon={<ImageIcon className="h-4 w-4" />}
            label="Imágenes"
            active={false}
            onClick={() => onOpenFinder?.("Imágenes")}
          />
          <SidebarItem
            icon={<Music className="h-4 w-4" />}
            label="Música"
            active={false}
            onClick={() => onOpenFinder?.("Música")}
          />
          <SidebarItem
            icon={<Gamepad2 className="h-4 w-4" />}
            label="Juegos"
            active={false}
            onClick={() => onOpenFinder?.("Juegos")}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-black/20 p-4" onClick={() => setSelectedProject(null)}>
          {currentProjects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-zinc-500">
              {searchQuery ? (
                <>
                  <Search className="h-16 w-16 mb-4 opacity-20" />
                  <p>No se encontraron resultados</p>
                </>
              ) : (
                <>
                  <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
                  <p>No hay proyectos en esta categoría</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 auto-rows-min">
              {currentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProject(project.id)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    onOpenProject?.(project.url)
                  }}
                  className={`group flex flex-col items-center gap-2 rounded-lg p-4 transition-all cursor-default border ${
                    selectedProject === project.id
                      ? "bg-white/10 border-white/20 shadow-lg shadow-black/20"
                      : "hover:bg-white/5 border-transparent hover:border-white/5"
                  }`}
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                      selectedProject === project.id
                        ? "bg-zinc-700/50"
                        : "bg-zinc-800/50 group-hover:bg-zinc-700/50"
                    }`}>
                      <project.Icon
                        className={`w-7 h-7 ${selectedProject === project.id ? "text-white" : "text-zinc-300 group-hover:text-white"} transition-colors`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center w-full">
                    <span
                      className={`text-xs font-medium truncate w-full px-1 rounded ${
                        selectedProject === project.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                      }`}
                    >
                      {project.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{project.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden h-10 items-center gap-1 px-2 border-t border-white/10 bg-zinc-900/50 overflow-x-auto">
        <button
          onClick={() => navigateTo("Todos")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Todos" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          <Home className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateTo("Favoritos")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Favoritos" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateTo("Juegos")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Juegos" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Juegos
        </button>
        <button
          onClick={() => navigateTo("Herramientas")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Herramientas" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Tools
        </button>
        <button
          onClick={() => navigateTo("IA")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "IA" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          IA
        </button>
      </div>

      {/* Status Bar */}
      <div className="hidden sm:flex h-8 items-center justify-between border-t border-white/10 bg-zinc-900/50 px-4 text-[10px] font-medium text-zinc-500 backdrop-blur-xl flex-shrink-0">
        <div className="flex gap-4">
          <span>{currentProjects.length} proyectos</span>
          {selectedProject && <span>1 seleccionado</span>}
        </div>
        <span className="text-zinc-600">Doble clic para abrir en el navegador</span>
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
