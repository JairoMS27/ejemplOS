"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  Plus,
  Star,
  Clock,
  Home,
  Globe,
  ExternalLink,
  Shield,
  Zap,
  Bookmark,
  Lock,
} from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
  favicon?: string
  isLoading?: boolean
  error?: string
}

interface Bookmark {
  name: string
  url: string
  icon?: string
}

interface HistoryItem {
  title: string
  url: string
  time: string
}

interface BrowserWindowProps {
  initialUrl?: string
}

export function BrowserWindow({ initialUrl }: BrowserWindowProps) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState("1")
  const [inputUrl, setInputUrl] = useState("")
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { name: "DuckDuckGo", url: "https://duckduckgo.com", icon: "🦆" },
    { name: "Wikipedia", url: "https://wikipedia.org", icon: "📚" },
    { name: "GitHub", url: "https://github.com", icon: "🐙" },
    { name: "Reddit", url: "https://reddit.com", icon: "🔴" },
    { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "📝" },
    { name: "MDN Docs", url: "https://developer.mozilla.org", icon: "📖" },
  ])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showPanel, setShowPanel] = useState<"bookmarks" | "history" | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map())

  // Initialize tabs on mount
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true)
      if (initialUrl) {
        const newTab = createTab(initialUrl)
        setTabs([newTab])
        setActiveTabId(newTab.id)
        // Navigate after a small delay
        setTimeout(() => {
          navigateTab(newTab.id, initialUrl)
        }, 50)
      } else {
        const homeTab = { id: "1", title: "Nueva pestaña", url: "home", isLoading: false }
        setTabs([homeTab])
        setActiveTabId("1")
      }
    }
  }, [initialUrl, hasInitialized])

  const createTab = (url?: string): Tab => ({
    id: Math.random().toString(36).substr(2, 9),
    title: url || "Nueva pestaña",
    url: url ? "loading" : "home",
    isLoading: !!url,
  })

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  const navigateTab = (tabId: string, input: string) => {
    let url = input.trim()

    // Determine if it's a search or URL
    const isSearch = !url.includes(".") || url.includes(" ")

    if (isSearch) {
      url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`
    } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    // Update tab state
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, url, title: input, isLoading: true, error: undefined }
        : tab
    ))

    // Add to history
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    setHistory(prev => [{ title: input, url, time: timeStr }, ...prev.slice(0, 49)])
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputUrl.trim()) {
      navigateTab(activeTabId, inputUrl.trim())
      setInputUrl("")
    }
  }

  const handleIframeLoad = (tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isLoading: false } : tab
    ))
  }

  const handleIframeError = (tabId: string, errorMsg: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isLoading: false, error: errorMsg } : tab
    ))
  }

  const handleRefresh = () => {
    if (activeTab && activeTab.url !== "home") {
      const iframe = iframeRefs.current.get(activeTabId)
      if (iframe) {
        setTabs(prev => prev.map(tab =>
          tab.id === activeTabId ? { ...tab, isLoading: true, error: undefined } : tab
        ))
        iframe.src = iframe.src
      }
    }
  }

  const handleGoHome = () => {
    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, url: "home", title: "Nueva pestaña", isLoading: false, error: undefined }
        : tab
    ))
  }

  const handleNewTab = () => {
    const newTab = createTab()
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (tabs.length === 1) {
      setTabs([{ id: "1", title: "Nueva pestaña", url: "home", isLoading: false }])
      setActiveTabId("1")
      return
    }

    const newTabs = tabs.filter(tab => tab.id !== id)
    setTabs(newTabs)

    if (activeTabId === id) {
      const currentIndex = tabs.findIndex(tab => tab.id === id)
      const newActiveIndex = currentIndex > 0 ? currentIndex - 1 : 0
      setActiveTabId(newTabs[newActiveIndex].id)
    }
  }

  const handleAddBookmark = () => {
    if (activeTab && activeTab.url !== "home") {
      const exists = bookmarks.some(b => b.url === activeTab.url)
      if (!exists) {
        setBookmarks(prev => [...prev, { name: activeTab.title, url: activeTab.url, icon: "⭐" }])
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()
    if (!draggedTabId || draggedTabId === targetTabId) return

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTabId)
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId)

    const newTabs = [...tabs]
    const [draggedTab] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(targetIndex, 0, draggedTab)

    setTabs(newTabs)
    setDraggedTabId(null)
  }

  const openInNewWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const quickLinks = [
    { name: "DuckDuckGo", url: "https://duckduckgo.com", icon: "🦆", color: "from-orange-500/20 to-red-500/20" },
    { name: "Wikipedia", url: "https://wikipedia.org", icon: "📚", color: "from-gray-500/20 to-gray-600/20" },
    { name: "GitHub", url: "https://github.com", icon: "🐙", color: "from-purple-500/20 to-pink-500/20" },
    { name: "Reddit", url: "https://reddit.com", icon: "🔴", color: "from-orange-500/20 to-orange-600/20" },
    { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "📝", color: "from-amber-500/20 to-orange-500/20" },
    { name: "MDN Docs", url: "https://developer.mozilla.org", icon: "📖", color: "from-blue-500/20 to-indigo-500/20" },
  ]

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Tab Bar */}
      <div className="h-10 bg-[#0a0a0a] flex items-end gap-0.5 px-2 pt-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tab.id)}
            onClick={() => setActiveTabId(tab.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-all duration-200 min-w-[120px] max-w-[200px] flex-shrink-0 ${
              activeTabId === tab.id
                ? "bg-[#1c1c1c] text-white border-t border-l border-r border-white/10"
                : "bg-transparent text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {tab.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin flex-shrink-0" />
            ) : tab.url === "home" ? (
              <Home className="w-4 h-4 text-white/60 flex-shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-white/60 flex-shrink-0" />
            )}
            <span className="truncate text-sm flex-1">{tab.title}</span>
            <button
              onClick={(e) => handleCloseTab(tab.id, e)}
              className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={handleNewTab}
          className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-all flex-shrink-0 mb-0.5"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* URL Bar */}
      <div className="h-14 bg-[#1c1c1c] border-b border-white/5 px-3 flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleGoHome}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Inicio"
          >
            <Home className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Recargar"
          >
            <RotateCw className={`w-4 h-4 text-white/60 ${activeTab?.isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-xl px-4 py-2 border border-white/5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            {activeTab?.url && activeTab.url !== "home" && activeTab.url.startsWith("https") && (
              <Lock className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            )}
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar en DuckDuckGo o ingresar URL..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/30 min-w-0"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleAddBookmark}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Agregar a marcadores"
          >
            <Star className={`w-4 h-4 ${activeTab && bookmarks.some(b => b.url === activeTab.url) ? "text-yellow-400 fill-yellow-400" : "text-white/60"}`} />
          </button>
          <button
            onClick={() => setShowPanel(showPanel === "bookmarks" ? null : "bookmarks")}
            className={`p-2 rounded-lg transition-colors ${showPanel === "bookmarks" ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60"}`}
            title="Marcadores"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPanel(showPanel === "history" ? null : "history")}
            className={`p-2 rounded-lg transition-colors ${showPanel === "history" ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60"}`}
            title="Historial"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookmarks/History Panel */}
      {showPanel && (
        <div className="bg-[#151515] border-b border-white/5 p-4 max-h-60 overflow-y-auto flex-shrink-0 animate-in slide-in-from-top-2 duration-200">
          {showPanel === "bookmarks" && (
            <div>
              <h3 className="text-white/80 text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Marcadores
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {bookmarks.map((bookmark, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigateTab(activeTabId, bookmark.url)
                      setShowPanel(null)
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm text-white/70 hover:text-white truncate transition-colors flex items-center gap-2"
                  >
                    <span>{bookmark.icon || "🔗"}</span>
                    <span className="truncate">{bookmark.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {showPanel === "history" && (
            <div>
              <h3 className="text-white/80 text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Historial reciente
              </h3>
              {history.length === 0 ? (
                <p className="text-white/30 text-sm">Sin historial todavía</p>
              ) : (
                <div className="space-y-1">
                  {history.slice(0, 10).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigateTab(activeTabId, item.url)
                        setShowPanel(null)
                      }}
                      className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left flex items-center gap-3 transition-colors"
                    >
                      <span className="text-white/30 text-xs font-mono">{item.time}</span>
                      <span className="flex-1 text-white/70 text-sm truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${tab.id === activeTabId ? "z-10" : "z-0 invisible"}`}
          >
            {tab.url === "home" ? (
              // Home Page
              <div className="w-full h-full bg-gradient-to-b from-[#0a0a0a] to-[#111] flex flex-col items-center justify-center p-6 overflow-auto">
                <div className="max-w-3xl w-full text-center">
                  {/* Logo */}
                  <div className="mb-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4">
                      <Globe className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">EjemplOS Browser</h1>
                    <p className="text-white/40 text-sm">Navega por la web de forma rápida y segura</p>
                  </div>

                  {/* Search Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const query = formData.get("search") as string
                      if (query?.trim()) {
                        navigateTab(activeTabId, query.trim())
                      }
                    }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all max-w-xl mx-auto">
                      <Search className="w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        name="search"
                        placeholder="Buscar en la web..."
                        className="flex-1 bg-transparent text-white outline-none placeholder-white/30"
                        autoComplete="off"
                      />
                    </div>
                  </form>

                  {/* Quick Links */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                    {quickLinks.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigateTab(activeTabId, link.url)}
                        className={`group p-4 bg-gradient-to-br ${link.color} hover:scale-[1.02] rounded-xl border border-white/5 hover:border-white/10 transition-all duration-200`}
                      >
                        <div className="text-3xl mb-2">{link.icon}</div>
                        <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">{link.name}</p>
                      </button>
                    ))}
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                      <h3 className="text-white/80 text-sm font-medium mb-1">Rápido</h3>
                      <p className="text-white/40 text-xs">Carga instantánea de sitios web</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <Shield className="w-5 h-5 text-green-400 mb-2" />
                      <h3 className="text-white/80 text-sm font-medium mb-1">Seguro</h3>
                      <p className="text-white/40 text-xs">Conexiones HTTPS protegidas</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <Globe className="w-5 h-5 text-blue-400 mb-2" />
                      <h3 className="text-white/80 text-sm font-medium mb-1">Abierto</h3>
                      <p className="text-white/40 text-xs">Accede a millones de sitios</p>
                    </div>
                  </div>

                  {/* Note */}
                  <p className="text-white/20 text-xs mt-8">
                    Nota: Algunos sitios pueden no cargar debido a restricciones de seguridad (X-Frame-Options)
                  </p>
                </div>
              </div>
            ) : (
              // Web Content
              <div className="w-full h-full relative bg-white">
                {/* Loading Overlay */}
                {tab.isLoading && (
                  <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center z-20">
                    <div className="text-center">
                      <div className="w-12 h-12 border-3 border-white/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-white/60 text-sm">Cargando página...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {tab.error && (
                  <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center z-20">
                    <div className="text-center max-w-md px-6">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">No se pudo cargar</h2>
                      <p className="text-white/50 text-sm mb-6">{tab.error}</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => openInNewWindow(tab.url)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir en navegador
                        </button>
                        <button
                          onClick={handleGoHome}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                        >
                          Volver al inicio
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Iframe */}
                <iframe
                  ref={(el) => {
                    if (el) iframeRefs.current.set(tab.id, el)
                  }}
                  src={tab.url}
                  className="w-full h-full border-none"
                  title={tab.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-pointer-lock"
                  onLoad={() => handleIframeLoad(tab.id)}
                  onError={() => handleIframeError(tab.id, "Este sitio no permite ser mostrado en un iframe embebido.")}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
