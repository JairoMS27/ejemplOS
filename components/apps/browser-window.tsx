"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  AlertTriangle,
  ExternalLink,
} from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
}

interface Bookmark {
  name: string
  url: string
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
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Initialize with the initial URL if provided
    if (initialUrl) {
      return [{ id: "1", title: initialUrl, url: "loading" }]
    }
    return [{ id: "1", title: "Nueva pestaña", url: "about:blank" }]
  })
  const [activeTabId, setActiveTabId] = useState("1")
  const [inputUrl, setInputUrl] = useState("")
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { name: "DuckDuckGo", url: "https://duckduckgo.com" },
    { name: "Wikipedia", url: "https://wikipedia.org" },
    { name: "GitHub", url: "https://github.com" },
  ])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>(initialUrl || "")
  const [hasLoadedInitialUrl, setHasLoadedInitialUrl] = useState(false)
  const blockedDomains = [
    "google.com",
    "youtube.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "instagram.com",
    "linkedin.com",
    "netflix.com",
    "amazon.com",
    "paypal.com",
    "bank",
    "apple.com",
    "microsoft.com",
  ]

  // Load initial URL on mount
  useEffect(() => {
    if (initialUrl && !hasLoadedInitialUrl) {
      setHasLoadedInitialUrl(true)
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        processAndNavigate(initialUrl, "1")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [initialUrl, hasLoadedInitialUrl])

  const processAndNavigate = (input: string, tabId: string) => {
    setLoadError(null)

    let urlToLoad = input

    if (!urlToLoad.includes(".") || urlToLoad.includes(" ")) {
      urlToLoad = `https://duckduckgo.com/?q=${encodeURIComponent(urlToLoad)}`
    } else {
      if (!urlToLoad.startsWith("http://") && !urlToLoad.startsWith("https://")) {
        urlToLoad = "https://" + urlToLoad
      }
    }

    setOriginalUrl(urlToLoad)

    if (isLikelyBlocked(urlToLoad)) {
      setLoadError(
        `Este sitio (${new URL(urlToLoad).hostname}) bloquea ser cargado por razones de seguridad. Muchos sitios importantes como Google, X, Facebook, etc. no permiten ser mostrados en iframes o proxies.`,
      )
      setTabs(prevTabs => prevTabs.map((tab) => (tab.id === tabId ? { ...tab, url: "blocked", title: input } : tab)))
      return
    }

    const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToLoad)}`

    const title = input

    setTabs(prevTabs => prevTabs.map((tab) => (tab.id === tabId ? { ...tab, url: proxiedUrl, title } : tab)))

    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    setHistory((prev) => [{ title, url: urlToLoad, time: timeStr }, ...prev.slice(0, 49)])
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  const isLikelyBlocked = (url: string): boolean => {
    const lowerUrl = url.toLowerCase()
    return blockedDomains.some((domain) => lowerUrl.includes(domain))
  }

  const handleUrlChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputUrl.trim()) {
      navigateToUrl(inputUrl.trim())
      setInputUrl("")
    }
  }

  const navigateToUrl = (input: string) => {
    processAndNavigate(input, activeTabId)
  }

  const handleGoBack = () => {
    const iframe = document.querySelector(`iframe[data-tab="${activeTabId}"]`) as HTMLIFrameElement
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.history.back()
      } catch (e) {
        console.log("[v0] Go back")
      }
    }
  }

  const handleGoForward = () => {
    const iframe = document.querySelector(`iframe[data-tab="${activeTabId}"]`) as HTMLIFrameElement
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.history.forward()
      } catch (e) {
        console.log("[v0] Go forward")
      }
    }
  }

  const handleRefresh = () => {
    if (activeTab && activeTab.url !== "about:blank") {
      if (originalUrl) {
        navigateToUrl(originalUrl)
      } else {
        setLoadError(null)
        const iframe = document.querySelector(`iframe[data-tab="${activeTabId}"]`) as HTMLIFrameElement
        if (iframe) {
          iframe.src = iframe.src
        }
      }
    }
  }

  const handleAddBookmark = () => {
    if (activeTab && activeTab.url !== "about:blank") {
      setBookmarks((prev) => [...prev, { name: activeTab.title, url: activeTab.url }])
    }
  }

  const handleGoHome = () => {
    setTabs(tabs.map((tab) => (tab.id === activeTabId ? { ...tab, url: "about:blank", title: "Nueva pestaña" } : tab)))
  }

  const handleNewTab = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    setTabs([...tabs, { id: newId, title: "Nueva pestaña", url: "about:blank" }])
    setActiveTabId(newId)
  }

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter((tab) => tab.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id)
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

    const draggedIndex = tabs.findIndex((tab) => tab.id === draggedTabId)
    const targetIndex = tabs.findIndex((tab) => tab.id === targetTabId)

    const newTabs = [...tabs]
    const [draggedTab] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(targetIndex, 0, draggedTab)

    setTabs(newTabs)
    setDraggedTabId(null)
  }

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* Tabs - scrollable on mobile */}
      <div className="h-10 bg-black flex items-end gap-1 px-1 sm:px-2 overflow-x-auto pt-2 flex-shrink-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tab.id)}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-t-lg cursor-move transition-colors whitespace-nowrap text-xs sm:text-sm flex-shrink-0 ${
              activeTabId === tab.id ? "bg-[#1a1a1a] text-white" : "bg-transparent text-white/60 hover:bg-white/5"
            }`}
          >
            <span className="max-w-20 sm:max-w-32 truncate">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCloseTab(tab.id)
              }}
              className="hover:bg-white/20 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={handleNewTab}
          className="mb-1 ml-1 p-1 hover:bg-white/10 rounded text-white/60 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation bar */}
      <div className="h-12 bg-[#1a1a1a] border-b border-white/10 px-2 sm:px-4 flex items-center gap-1 sm:gap-3 flex-shrink-0">
        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            onClick={handleGoBack}
            disabled={!canGoBack}
            className="p-1 sm:p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={handleGoForward}
            disabled={!canGoForward}
            className="p-1 sm:p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>
          <button onClick={handleRefresh} className="p-1 sm:p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <RotateCw className="w-3.5 h-3.5 text-white/80" />
          </button>
          <button onClick={handleGoHome} className="hidden sm:block p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <Home className="w-4 h-4 text-white/80" />
          </button>
        </div>

        <form onSubmit={handleUrlChange} className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 bg-black/40 rounded-full px-2 sm:px-4 py-1.5 flex items-center gap-2 border border-white/5 focus-within:border-white/20 transition-colors">
            <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar o URL..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none placeholder-white/40 min-w-0"
            />
          </div>
        </form>

        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            onClick={handleAddBookmark}
            className="hidden sm:block p-1.5 hover:bg-white/10 rounded-full transition-colors"
            title="Agregar marcador"
          >
            <Star className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={() => {
              setShowBookmarks(!showBookmarks)
              setShowHistory(false)
            }}
            className={`p-1 sm:p-1.5 rounded-full transition-colors ${showBookmarks ? "bg-white/20" : "hover:bg-white/10"}`}
            title="Marcadores"
          >
            <Star className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={() => {
              setShowHistory(!showHistory)
              setShowBookmarks(false)
            }}
            className={`p-1 sm:p-1.5 rounded-full transition-colors ${showHistory ? "bg-white/20" : "hover:bg-white/10"}`}
            title="Historial"
          >
            <Clock className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {(showBookmarks || showHistory) && (
        <div className="bg-white/10 border-b border-white/20 p-2 sm:p-4 max-h-48 overflow-y-auto flex-shrink-0">
          {showBookmarks && (
            <div>
              <h3 className="text-white text-sm font-semibold mb-2">Marcadores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bookmarks.map((bookmark, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateToUrl(bookmark.url)}
                    className="px-2 sm:px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-left text-xs sm:text-sm text-white/80 truncate"
                  >
                    {bookmark.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showHistory && (
            <div>
              <h3 className="text-white text-sm font-semibold mb-2">Historial</h3>
              <div className="space-y-1">
                {history.length === 0 ? (
                  <p className="text-white/40 text-sm">Sin historial</p>
                ) : (
                  history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigateToUrl(item.url)}
                      className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-left flex items-center gap-3"
                    >
                      <span className="text-white/40 text-xs">{item.time}</span>
                      <span className="flex-1 text-white/80 text-sm truncate">{item.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-white relative">
        {activeTab && activeTab.url === "loading" ? (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/80 text-sm">Cargando...</p>
            </div>
          </div>
        ) : activeTab && activeTab.url === "blocked" && loadError ? (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center max-w-2xl px-6">
              <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Sitio bloqueado</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{loadError}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 mb-3 font-medium">
                  Sitios que típicamente no funcionan en navegadores embebidos:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>• Google y servicios de Google</div>
                  <div>• X (Twitter)</div>
                  <div>• Facebook e Instagram</div>
                  <div>• LinkedIn</div>
                  <div>• YouTube</div>
                  <div>• Netflix</div>
                  <div>• Sitios bancarios</div>
                  <div>• Amazon y PayPal</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.open(originalUrl, "_blank")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir en navegador real
                </button>
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Volver al inicio
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Sitios como Wikipedia, GitHub, DuckDuckGo y la mayoría de blogs funcionan correctamente
              </p>
            </div>
          </div>
        ) : activeTab && activeTab.url !== "about:blank" ? (
          <>
            {loadError && activeTab.url !== "blocked" && (
              <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                <div className="text-center max-w-md px-4">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No se pudo cargar la página</h2>
                  <p className="text-gray-600 mb-4">{loadError}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={() => window.open(originalUrl, "_blank")}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir en navegador real
                    </button>
                  </div>
                </div>
              </div>
            )}
            <iframe
              key={activeTab.id}
              data-tab={activeTab.id}
              src={activeTab.url}
              className="w-full h-full border-none"
              title={activeTab.title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-pointer-lock allow-modals"
              onError={() =>
                setLoadError("Error al cargar el sitio. Puede que este sitio no permita ser mostrado en iframes.")
              }
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black overflow-auto">
            <div className="text-center max-w-2xl px-4 py-6">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">EjemplOS Browser</h1>
              <p className="text-white/60 mb-4 sm:mb-8 text-sm sm:text-base">
                Ingresa una URL o búsqueda en la barra superior para navegar por la web
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
                {bookmarks.slice(0, 6).map((bookmark, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateToUrl(bookmark.url)}
                    className="p-3 sm:p-6 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-lg sm:text-2xl text-white">{bookmark.name[0]}</span>
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm font-medium truncate">{bookmark.name}</p>
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 max-w-xl mx-auto">
                <p className="text-xs sm:text-sm text-white/60 mb-2">
                  Nota: Algunos sitios como Google, X, Facebook, etc. no permiten ser cargados por razones de seguridad.
                </p>
                <p className="text-[10px] sm:text-xs text-white/40">
                  Funciona perfectamente con Wikipedia, GitHub, blogs y la mayoría de sitios web.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
