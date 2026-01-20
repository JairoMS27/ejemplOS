"use client"

import { useState, useEffect, useRef } from "react"
import { Lock } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { useI18n } from "@/lib/i18n-context"

interface LockScreenProps {
  onUnlock: () => void
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { settings, verifyPin } = useSettings()
  const { t } = useI18n()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    setPin(numericValue)
    setError(false)

    // Auto-submit when 4 digits entered
    if (numericValue.length === 4) {
      handleUnlock(numericValue)
    }
  }

  const handleUnlock = (pinValue: string = pin) => {
    if (verifyPin(pinValue)) {
      setUnlocking(true)
      setTimeout(() => {
        onUnlock()
      }, 500)
    } else {
      setError(true)
      setShake(true)
      setPin("")
      setTimeout(() => setShake(false), 500)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleUnlock()
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-[100] transition-opacity duration-500 ${
        unlocking ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className={`relative z-10 text-center ${shake ? "animate-shake" : ""}`}>
        {/* Logo */}
        <div className="w-24 h-24 mx-auto mb-8 border-2 border-white/20 rounded-2xl flex items-center justify-center">
          <span className="text-4xl font-bold text-white">EJ</span>
        </div>

        {/* Welcome message */}
        {settings.user.name && (
          <p className="text-white/60 text-lg mb-2">
            {t.lockScreen.welcome}, <span className="text-white font-medium">{settings.user.name}</span>
          </p>
        )}

        <h1 className="text-2xl font-bold text-white mb-2">
          {t.lockScreen.title}
        </h1>
        <p className="text-white/40 mb-8">
          {t.lockScreen.subtitle}
        </p>

        {/* PIN Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-3 mb-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  pin.length > index
                    ? error
                      ? "bg-red-500 border-red-500"
                      : "bg-white border-white"
                    : "border-white/30"
                }`}
              />
            ))}
          </div>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="sr-only"
            autoFocus
          />

          {/* Clickable area to focus input */}
          <button
            onClick={() => inputRef.current?.focus()}
            className="w-48 h-12 mx-auto bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/40 hover:bg-white/10 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span className="text-sm">
              {pin.length > 0 ? "****".slice(0, pin.length) : t.lockScreen.unlock}
            </span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm animate-in fade-in duration-200">
            {t.lockScreen.wrongPin}
          </p>
        )}

        {/* Numeric keypad for mobile */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, index) => (
            <button
              key={index}
              onClick={() => {
                if (key === null) return
                if (key === "del") {
                  setPin(pin.slice(0, -1))
                  setError(false)
                } else if (pin.length < 4) {
                  handlePinChange(pin + key)
                }
              }}
              disabled={key === null}
              className={`w-16 h-16 rounded-xl text-xl font-medium transition-all ${
                key === null
                  ? "invisible"
                  : key === "del"
                    ? "bg-white/5 text-white/60 hover:bg-white/10"
                    : "bg-white/10 text-white hover:bg-white/20 active:scale-95"
              }`}
            >
              {key === "del" ? (
                <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
