"use client"

import { X } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[500px] bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden scale-in-95 animate-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/50">
          <h2 className="text-sm font-medium text-white">{t.changelog.title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">{t.changelog.bugFixes}</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.bugFixesList.audioStops}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.bugFixesList.windowResize}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.bugFixesList.projectsNav}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">
              {t.changelog.qualityOfLife}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.qualityOfLifeList.browserDesktop}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.qualityOfLifeList.finderSidebar}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.qualityOfLifeList.desktopLocation}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-3">{t.changelog.uiImprovements}</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.uiImprovementsList.navigationPaths}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.uiImprovementsList.selectionDesign}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1.5 w-1 h-1 rounded-full bg-current" />
                <span>{t.changelog.uiImprovementsList.consistentSidebar}</span>
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
            {t.changelog.understood}
          </button>
        </div>
      </div>
    </div>
  )
}
