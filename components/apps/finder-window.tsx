"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Folder,
  File,
  HardDrive,
  Music,
  ImageIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Home,
  Download,
  LayoutGrid,
  Gamepad2,
  Globe,
  DoorOpen,
  Palette,
  Monitor,
  Settings,
  FolderOpen,
} from "lucide-react"

interface FileItem {
  name: string
  type: "folder" | "file" | "document" | "image" | "music" | "app"
  icon: React.ReactNode
  size?: string
  modified?: string
  imageUrl?: string
  audioUrl?: string
  appType?: "games" | "browser" | "external-link" | "paint" | "ejpod" | "settings"
  gameType?: "minesweeper" | "tetris" | "2048" | "snake"
  url?: string
}

interface FinderWindowProps {
  onOpenFile?: (fileName: string, fileType: string, mediaUrl?: string) => void
  onOpenGame?: (gameType: "minesweeper" | "tetris" | "2048" | "snake") => void
  onOpenApp?: (appType: "browser" | "paint" | "ejpod" | "settings", url?: string) => void
  isMaximized?: boolean
  initialPath?: string
}

export function FinderWindow({
  onOpenFile,
  onOpenGame,
  onOpenApp,
  isMaximized,
  initialPath = "Inicio",
}: FinderWindowProps) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([initialPath])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedImages, setSavedImages] = useState<FileItem[]>([])

  useEffect(() => {
    // Load saved images from localStorage
    const loadSavedImages = () => {
      try {
        const images = JSON.parse(localStorage.getItem("paint_images") || "[]")
        const formattedImages: FileItem[] = images.map((img: any) => ({
          name: img.name,
          type: "image",
          icon: <ImageIcon className="w-10 h-10 text-zinc-300" />,
          size: "PNG",
          modified: new Date(img.date).toLocaleDateString(),
          imageUrl: img.dataUrl,
        }))
        setSavedImages(formattedImages)
      } catch (e) {
        console.error("Error loading saved images", e)
      }
    }

    loadSavedImages()
    // Listen for storage events to update in real-time
    window.addEventListener("storage", loadSavedImages)
    return () => window.removeEventListener("storage", loadSavedImages)
  }, [])

  const filesData: Record<string, FileItem[]> = {
    Inicio: [
      { name: "Documentos", type: "folder", icon: <Folder className="w-10 h-10 text-zinc-400 fill-zinc-400/20" /> },
      { name: "Descargas", type: "folder", icon: <Folder className="w-10 h-10 text-zinc-400 fill-zinc-400/20" /> },
      { name: "Imágenes", type: "folder", icon: <Folder className="w-10 h-10 text-zinc-400 fill-zinc-400/20" /> },
      { name: "Música", type: "folder", icon: <Folder className="w-10 h-10 text-zinc-400 fill-zinc-400/20" /> },
      {
        name: "Juegos",
        type: "app",
        appType: "games",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-400 fill-zinc-400/20" />,
        size: "App",
      },
      {
        name: "Aplicaciones",
        type: "folder",
        icon: <LayoutGrid className="w-10 h-10 text-zinc-400 fill-zinc-400/20" />,
      },
    ],
    Escritorio: [
      {
        name: "Portfolio",
        type: "app",
        appType: "browser",
        url: "https://jairoms.is-a.dev",
        icon: <DoorOpen className="w-10 h-10 text-zinc-300" />,
        size: "Link",
        modified: "Hoy",
      },
      {
        name: "X",
        type: "app",
        appType: "browser",
        url: "https://twitter.com/ej3mplo",
        icon: (
          <svg className="w-10 h-10 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
        size: "Link",
        modified: "Hoy",
      },
      {
        name: "Juegos",
        type: "app",
        appType: "games",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-300" />,
        size: "Carpeta",
        modified: "Hoy",
      },
      {
        name: "Mis Proyectos",
        type: "folder",
        icon: <FolderOpen className="w-10 h-10 text-zinc-400 fill-zinc-400/20" />,
        size: "Carpeta",
        modified: "Hoy",
      },
      {
        name: "Paint",
        type: "app",
        appType: "paint",
        icon: <Palette className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Ajustes",
        type: "app",
        appType: "settings",
        icon: <Settings className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "EjPod",
        type: "app",
        appType: "ejpod",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Navegador",
        type: "app",
        appType: "browser",
        icon: <Globe className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
    ],
    Aplicaciones: [
      {
        name: "Navegador",
        type: "app",
        appType: "browser",
        icon: <Globe className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Finder",
        type: "folder",
        icon: <Folder className="w-10 h-10 text-zinc-400 fill-zinc-400/20" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "EjPod",
        type: "app",
        appType: "ejpod",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Paint",
        type: "app",
        appType: "paint",
        icon: <Palette className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Juegos",
        type: "app",
        appType: "games",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Ajustes",
        type: "app",
        appType: "settings",
        icon: <Settings className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
    ],
    Documentos: [
      {
        name: "Proyecto.txt",
        type: "document",
        icon: <FileText className="w-10 h-10 text-zinc-300" />,
        size: "12 KB",
        modified: "Hoy",
      },
      {
        name: "Notas.txt",
        type: "document",
        icon: <FileText className="w-10 h-10 text-zinc-300" />,
        size: "5 KB",
        modified: "Ayer",
      },
      {
        name: "Manual.pdf",
        type: "file",
        icon: <File className="w-10 h-10 text-zinc-300" />,
        size: "2.4 MB",
        modified: "Ayer",
      },
      {
        name: "Presupuesto.xlsx",
        type: "file",
        icon: <File className="w-10 h-10 text-zinc-300" />,
        size: "156 KB",
        modified: "Hace 3 días",
      },
    ],
    Descargas: [
      {
        name: "instalador.dmg",
        type: "file",
        icon: <HardDrive className="w-10 h-10 text-zinc-500" />,
        size: "145 MB",
        modified: "Hoy",
      },
      {
        name: "archivo.zip",
        type: "file",
        icon: <File className="w-10 h-10 text-zinc-300" />,
        size: "1.2 MB",
        modified: "Hace 2 días",
      },
    ],
    Imágenes: [
      ...savedImages,
      {
        name: "OIG21.png",
        type: "image",
        icon: <ImageIcon className="w-10 h-10 text-zinc-300" />,
        size: "2.1 MB",
        modified: "Hace 1 semana",
        imageUrl: "/images/oig21.png",
      },
      {
        name: "OIG19.png",
        type: "image",
        icon: <ImageIcon className="w-10 h-10 text-zinc-300" />,
        size: "1.8 MB",
        modified: "Hace 1 semana",
        imageUrl: "/images/oig19.png",
      },
      {
        name: "EJ_Doble.webp",
        type: "image",
        icon: <ImageIcon className="w-10 h-10 text-zinc-300" />,
        size: "3.2 MB",
        modified: "Hace 2 semanas",
        imageUrl: "/images/dall-c2-b7e-202024-05-18-2003.webp",
      },
      {
        name: "EJ_Colores.webp",
        type: "image",
        icon: <ImageIcon className="w-10 h-10 text-zinc-300" />,
        size: "2.8 MB",
        modified: "Hace 2 semanas",
        imageUrl: "/images/dall-c2-b7e-202024-05-16-2021.webp",
      },
      {
        name: "EJ_Original.png",
        type: "image",
        icon: <ImageIcon className="w-10 h-10 text-zinc-300" />,
        size: "1.5 MB",
        modified: "Hace 3 semanas",
        imageUrl: "/images/chatgpt-20image-2013-20abr-202025-2c-2015-39-39-min.png",
      },
    ],
    Música: [
      {
        name: "NO LOVE MODE.wav",
        type: "music",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "5.2 MB",
        modified: "Hoy",
        audioUrl: "https://image2url.com/r2/default/audio/1768434262419-43b9ab05-0f25-480d-94dc-4c633ad19eb5.wav",
      },
      {
        name: "GHOST USER.flac",
        type: "music",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "4.8 MB",
        modified: "Hoy",
        audioUrl: "https://image2url.com/r2/default/audio/1768434396376-72504136-d644-4499-9ae4-a4030924f5ab.flac",
      },
      {
        name: "VENENO.mp3",
        type: "music",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "3.9 MB",
        modified: "Hoy",
        audioUrl: "https://image2url.com/r2/default/audio/1768434467002-479e1ed9-7177-4fca-a72a-63b262a7d874.mp3",
      },
      {
        name: "NEON VEINS.mp3",
        type: "music",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "4.1 MB",
        modified: "Hoy",
        audioUrl: "https://image2url.com/r2/default/audio/1768434524284-2a665fb6-edc4-4c92-988b-45d0846438dd.mp3",
      },
      {
        name: "gema fake.mp3",
        type: "music",
        icon: <Music className="w-10 h-10 text-zinc-300" />,
        size: "3.7 MB",
        modified: "Hoy",
        audioUrl: "https://image2url.com/r2/default/audio/1768434507735-f5538049-4d29-43b3-818d-1cfbd2461351.mp3",
      },
    ],
    Juegos: [
      {
        name: "Buscaminas",
        type: "app",
        gameType: "minesweeper",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Snake",
        type: "app",
        gameType: "snake",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "Tetris",
        type: "app",
        gameType: "tetris",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
      {
        name: "2048",
        type: "app",
        gameType: "2048",
        icon: <Gamepad2 className="w-10 h-10 text-zinc-300" />,
        size: "App",
        modified: "Hoy",
      },
    ],
  }

  const currentFiles = (filesData[currentPath] || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(path)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCurrentPath(path)
    setSelectedItem(null)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCurrentPath(history[historyIndex - 1])
      setSelectedItem(null)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCurrentPath(history[historyIndex + 1])
      setSelectedItem(null)
    }
  }

  const handleDoubleClick = (item: FileItem) => {
    if (item.type === "folder") {
      navigateTo(item.name)
    } else if (item.type === "app" && item.appType === "games") {
      navigateTo("Juegos")
    } else if (item.type === "app" && item.appType === "browser") {
      onOpenApp?.("browser", item.url)
    } else if (item.type === "app" && item.appType === "paint") {
      onOpenApp?.("paint")
    } else if (item.type === "app" && item.appType === "ejpod") {
      onOpenApp?.("ejpod")
    } else if (item.type === "app" && item.appType === "settings") {
      onOpenApp?.("settings")
    } else if (item.type === "app" && item.appType === "external-link" && item.url) {
      window.location.href = item.url
    } else if (item.type === "app" && item.gameType) {
      onOpenGame?.(item.gameType)
    } else {
      const mediaUrl = item.type === "image" ? item.imageUrl : item.type === "music" ? item.audioUrl : undefined
      onOpenFile?.(item.name, item.type, mediaUrl)
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
          <span className="hover:text-white cursor-pointer transition-colors hidden sm:inline" onClick={() => navigateTo("Inicio")}>
            EjemplOS
          </span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="text-white truncate">{currentPath}</span>
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
            label="Inicio"
            active={currentPath === "Inicio"}
            onClick={() => navigateTo("Inicio")}
          />
          <SidebarItem
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Aplicaciones"
            active={currentPath === "Aplicaciones"}
            onClick={() => navigateTo("Aplicaciones")}
          />

          <div className="mt-4 mb-2 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ubicaciones</div>
          <SidebarItem
            icon={<Monitor className="h-4 w-4" />}
            label="Escritorio"
            active={currentPath === "Escritorio"}
            onClick={() => navigateTo("Escritorio")}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Documentos"
            active={currentPath === "Documentos"}
            onClick={() => navigateTo("Documentos")}
          />
          <SidebarItem
            icon={<Download className="h-4 w-4" />}
            label="Descargas"
            active={currentPath === "Descargas"}
            onClick={() => navigateTo("Descargas")}
          />
          <SidebarItem
            icon={<ImageIcon className="h-4 w-4" />}
            label="Imágenes"
            active={currentPath === "Imágenes"}
            onClick={() => navigateTo("Imágenes")}
          />
          <SidebarItem
            icon={<Music className="h-4 w-4" />}
            label="Música"
            active={currentPath === "Música"}
            onClick={() => navigateTo("Música")}
          />
          <SidebarItem
            icon={<Gamepad2 className="h-4 w-4" />}
            label="Juegos"
            active={currentPath === "Juegos"}
            onClick={() => navigateTo("Juegos")}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-black/20 p-4" onClick={() => setSelectedItem(null)}>
          {currentFiles.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-zinc-500">
              {searchQuery ? (
                <>
                  <Search className="h-16 w-16 mb-4 opacity-20" />
                  <p>No se encontraron resultados</p>
                </>
              ) : (
                <>
                  <Folder className="h-16 w-16 mb-4 opacity-20" />
                  <p>Carpeta vacía</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 auto-rows-min">
              {currentFiles.map((item, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItem(item.name)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleDoubleClick(item)
                  }}
                  className={`group flex flex-col items-center gap-2 rounded-lg p-4 transition-all cursor-default border ${
                    selectedItem === item.name
                      ? "bg-white/10 border-white/20 shadow-lg shadow-black/20"
                      : "hover:bg-white/5 border-transparent hover:border-white/5"
                  }`}
                >
                  <div className="relative">
                    {item.icon}
                    {item.type === "folder" && (
                      <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                        <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center w-full">
                    <span
                      className={`text-xs font-medium truncate w-full px-1 rounded ${
                        selectedItem === item.name ? "text-white" : "text-zinc-300 group-hover:text-white"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{item.size || "Carpeta"}</span>
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
          onClick={() => navigateTo("Inicio")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Inicio" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          <Home className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateTo("Aplicaciones")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Aplicaciones" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Apps
        </button>
        <button
          onClick={() => navigateTo("Documentos")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Documentos" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Docs
        </button>
        <button
          onClick={() => navigateTo("Imágenes")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Imágenes" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Img
        </button>
        <button
          onClick={() => navigateTo("Música")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Música" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Música
        </button>
        <button
          onClick={() => navigateTo("Juegos")}
          className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${currentPath === "Juegos" ? "bg-white/10 text-white" : "text-zinc-400"}`}
        >
          Juegos
        </button>
      </div>

      {/* Status Bar */}
      <div className="hidden sm:flex h-8 items-center justify-between border-t border-white/10 bg-zinc-900/50 px-4 text-[10px] font-medium text-zinc-500 backdrop-blur-xl flex-shrink-0">
        <div className="flex gap-4">
          <span>{currentFiles.length} ítems</span>
          {selectedItem && <span>1 seleccionado</span>}
        </div>
        <div className="flex gap-2">
          <LayoutGrid className="w-3 h-3 opacity-50" />
          <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-zinc-600" />
          </div>
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
