'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n-context'

export function BootScreen() {
  const [text, setText] = useState<string[]>([])
  const [showLogo, setShowLogo] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const bootSequence = [
      t.boot.starting,
      t.boot.loadingKernel,
      t.boot.checkingFilesystem,
      t.boot.mountingVolumes,
      t.boot.startingGui,
      t.boot.ready
    ]

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setText(prev => [...prev, bootSequence[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowLogo(true), 500)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [t])

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      {!showLogo ? (
        <div className="w-full max-w-2xl p-8">
          {text.map((line, i) => (
            <div key={i} className="text-green-500 text-sm mb-1 animate-fade-in">
              <span className="text-white/50 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {line}
            </div>
          ))}
          <div className="w-3 h-5 bg-green-500 animate-pulse mt-2" />
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white blur-2xl opacity-20 animate-pulse" />
            <h1 className="text-8xl font-bold text-white tracking-tighter relative z-10">EJ</h1>
          </div>
          
          <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-[loading_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
