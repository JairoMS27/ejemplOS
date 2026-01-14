"use client"

import { X } from "lucide-react"

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[500px] bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden scale-in-95 animate-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/50">
          <h2 className="text-sm font-medium text-white">Novedades - EjemplOS v1.2</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">Novedades</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Nuevo reproductor de música EjPod</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Visualizador de audio circular estilo Windows Media Player</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Click wheel funcional con controles de navegación</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">
              Mejoras de Diseño
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Interfaz EjPod con pantalla y rueda de control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Efectos de visualización en tiempo real con degradados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Paleta de colores consistente con el sistema operativo</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-3">Características</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Detección automática de canciones en la carpeta Música</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Reproducción automática al abrir archivos de música</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Acceso rápido desde el taskbar y menú de inicio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>Barra de progreso y tiempo de reproducción</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-900/30 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
