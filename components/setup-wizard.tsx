"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronRight, ChevronLeft, User, Languages, Palette, Lock, Upload, Image, Paintbrush, Grid3X3 } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { useI18n } from "@/lib/i18n-context"

interface SetupWizardProps {
  onComplete: () => void
}

type Step = "welcome" | "language" | "user" | "theme" | "pin" | "complete"
type PinField = "pin" | "confirm"

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [userName, setUserName] = useState("")
  const [showGrid, setShowGrid] = useState(true)
  const [showWatermark, setShowWatermark] = useState(true)
  const [wallpaperType, setWallpaperType] = useState<"default" | "solid" | "image">("default")
  const [wallpaperColor, setWallpaperColor] = useState("#000000")
  const [wallpaperImageUrl, setWallpaperImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState(false)
  const [activePinField, setActivePinField] = useState<PinField>("pin")
  const pinInputRef = useRef<HTMLInputElement>(null)
  const confirmPinInputRef = useRef<HTMLInputElement>(null)

  const { updateUser, updateDesktop, updateWallpaper, completeSetup } = useSettings()
  const { t, language, setLanguage } = useI18n()

  // Focus PIN input when enabled
  useEffect(() => {
    if (pinEnabled && currentStep === "pin") {
      if (activePinField === "pin") {
        pinInputRef.current?.focus()
      } else {
        confirmPinInputRef.current?.focus()
      }
    }
  }, [pinEnabled, currentStep, activePinField])

  // Auto-switch to confirm field when first PIN is complete
  useEffect(() => {
    if (pin.length === 4 && activePinField === "pin") {
      setActivePinField("confirm")
    }
  }, [pin, activePinField])

  // Handle image upload for wallpaper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setWallpaperImageUrl(imageUrl)
        setWallpaperType("image")
      }
      reader.readAsDataURL(file)
    }
  }

  // Predefined wallpaper colors
  const presetColors = [
    "#000000", "#1a1a2e", "#16213e", "#0f3460",
    "#1e3a5f", "#2d4263", "#3d5a80", "#293241",
  ]

  const steps: Step[] = ["welcome", "language", "user", "theme", "pin", "complete"]
  const currentStepIndex = steps.indexOf(currentStep)

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handlePinNext = () => {
    if (pinEnabled) {
      if (pin.length !== 4 || pin !== confirmPin) {
        setPinError(true)
        return
      }
    }
    setPinError(false)
    goNext()
  }

  const handleFinish = () => {
    updateUser({
      name: userName || "User",
      pinEnabled: pinEnabled,
      pin: pinEnabled ? pin : "",
    })
    updateDesktop({ showGrid, showWatermark })
    updateWallpaper({
      type: wallpaperType,
      color: wallpaperColor,
      imageUrl: wallpaperImageUrl,
    })
    completeSetup()
    onComplete()
  }

  const renderStepIndicator = () => {
    const visibleSteps: Step[] = ["language", "user", "theme", "pin"]
    const currentVisibleIndex = visibleSteps.indexOf(currentStep as "language" | "user" | "theme" | "pin")

    if (currentStep === "welcome" || currentStep === "complete") return null

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {visibleSteps.map((step, index) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= currentVisibleIndex ? "bg-white" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
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
      <div className="relative z-10 w-full max-w-lg mx-4">
        {renderStepIndicator()}

        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 mx-auto mb-8 border-2 border-white rounded-2xl flex items-center justify-center">
              <span className="text-4xl font-bold text-white">EJ</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t.setup.welcome}
            </h1>
            <p className="text-lg text-white/60 mb-12">
              {t.setup.welcomeSubtitle}
            </p>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
            >
              {t.setup.letsStart}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Language Step */}
        {currentStep === "language" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-xl flex items-center justify-center">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t.setup.languageTitle}
              </h2>
              <p className="text-white/60">
                {t.setup.languageSubtitle}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <button
                onClick={() => setLanguage("en")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  language === "en"
                    ? "bg-white/10 border-white text-white"
                    : "border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🇺🇸</span>
                  <div className="text-left">
                    <p className="font-medium text-white">English</p>
                    <p className="text-sm text-white/40">English (US)</p>
                  </div>
                </div>
                {language === "en" && <Check className="w-5 h-5 text-white" />}
              </button>

              <button
                onClick={() => setLanguage("es")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  language === "es"
                    ? "bg-white/10 border-white text-white"
                    : "border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🇪🇸</span>
                  <div className="text-left">
                    <p className="font-medium text-white">Español</p>
                    <p className="text-sm text-white/40">Spanish</p>
                  </div>
                </div>
                {language === "es" && <Check className="w-5 h-5 text-white" />}
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.setup.back}
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
              >
                {t.setup.next}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* User Name Step */}
        {currentStep === "user" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t.setup.userTitle}
              </h2>
              <p className="text-white/60">
                {t.setup.userSubtitle}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm text-white/40 mb-2">
                {t.setup.userName} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t.setup.userPlaceholder}
                className={`w-full px-4 py-4 bg-white/5 border-2 rounded-xl text-white placeholder-white/30 focus:outline-none transition-colors text-lg ${
                  userName.trim() ? "border-white/10 focus:border-white/40" : "border-white/10 focus:border-white/40"
                }`}
                autoFocus
              />
              {!userName.trim() && (
                <p className="text-white/40 text-xs mt-2">{t.setup.nameRequired}</p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.setup.back}
              </button>
              <button
                onClick={goNext}
                disabled={!userName.trim()}
                className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all ${
                  userName.trim()
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/20 text-white/40 cursor-not-allowed"
                }`}
              >
                {t.setup.next}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Theme Step */}
        {currentStep === "theme" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-xl flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t.setup.themeTitle}
              </h2>
              <p className="text-white/60">
                {t.setup.themeSubtitle}
              </p>
            </div>

            {/* Preview */}
            <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-white/10">
              {/* Wallpaper base */}
              {wallpaperType === "default" && (
                <div className="absolute inset-0 bg-black" />
              )}
              {wallpaperType === "solid" && (
                <div className="absolute inset-0" style={{ backgroundColor: wallpaperColor }} />
              )}
              {wallpaperType === "image" && wallpaperImageUrl && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${wallpaperImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {/* Grid overlay */}
              {showGrid && (
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(white 1px, transparent 1px),
                      linear-gradient(90deg, white 1px, transparent 1px)
                    `,
                    backgroundSize: "25px 25px",
                  }}
                />
              )}
              {/* Watermark */}
              {showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white opacity-20">EJ</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 h-3 bg-white/10 rounded" />
            </div>

            <div className="space-y-3 mb-6">
              {/* Wallpaper Type Selector - Compact horizontal */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWallpaperType("default")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    wallpaperType === "default"
                      ? "bg-white/10 border-white text-white"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="text-xs">{t.setup.wallpaperDefault}</span>
                </button>
                <button
                  onClick={() => setWallpaperType("solid")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    wallpaperType === "solid"
                      ? "bg-white/10 border-white text-white"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <Paintbrush className="w-4 h-4" />
                  <span className="text-xs">{t.setup.wallpaperColor}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    wallpaperType === "image"
                      ? "bg-white/10 border-white text-white"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span className="text-xs">{t.setup.wallpaperImage}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Color Palette - Inline */}
              {wallpaperType === "solid" && (
                <div className="flex items-center gap-2 animate-in fade-in duration-200">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setWallpaperColor(color)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${
                        wallpaperColor === color
                          ? "border-white scale-110"
                          : "border-transparent hover:border-white/30"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={wallpaperColor}
                    onChange={(e) => setWallpaperColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-white/20"
                  />
                </div>
              )}

              {/* Image uploaded indicator - Compact */}
              {wallpaperType === "image" && wallpaperImageUrl && (
                <div className="flex items-center gap-2 text-sm animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-white/60">{t.setup.imageUploaded}</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    {t.setup.changeImage}
                  </button>
                </div>
              )}

              {/* Grid & Watermark Toggles - Side by side */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex-1 flex items-center justify-between p-3 rounded-xl border transition-all ${
                    showGrid
                      ? "bg-white/10 border-white"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="text-white text-xs">{t.setup.showGrid}</span>
                  <div
                    className={`w-8 h-5 rounded-full transition-colors ${
                      showGrid ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-black transition-transform mt-1 ${
                        showGrid ? "translate-x-4 ml-0" : "translate-x-1"
                      }`}
                    />
                  </div>
                </button>

                <button
                  onClick={() => setShowWatermark(!showWatermark)}
                  className={`flex-1 flex items-center justify-between p-3 rounded-xl border transition-all ${
                    showWatermark
                      ? "bg-white/10 border-white"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="text-white text-xs">{t.setup.showWatermark}</span>
                  <div
                    className={`w-8 h-5 rounded-full transition-colors ${
                      showWatermark ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-black transition-transform mt-1 ${
                        showWatermark ? "translate-x-4 ml-0" : "translate-x-1"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.setup.back}
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
              >
                {t.setup.next}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PIN Step */}
        {currentStep === "pin" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t.setup.pinTitle}
              </h2>
              <p className="text-white/60">
                {t.setup.pinSubtitle}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Enable PIN toggle */}
              <button
                onClick={() => {
                  setPinEnabled(!pinEnabled)
                  setPinError(false)
                  if (pinEnabled) {
                    setPin("")
                    setConfirmPin("")
                  }
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  pinEnabled
                    ? "bg-white/10 border-white"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="text-white">{t.setup.enablePin}</span>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    pinEnabled ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform mt-1 ${
                      pinEnabled ? "translate-x-5 ml-0" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>

              {/* PIN inputs */}
              {pinEnabled && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* PIN Field */}
                  <div>
                    <label className="block text-sm text-white/40 mb-3 text-center">
                      {t.setup.pinLabel}
                    </label>
                    <button
                      onClick={() => {
                        setActivePinField("pin")
                        pinInputRef.current?.focus()
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        activePinField === "pin"
                          ? "border-white bg-white/5"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex justify-center gap-4">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              pin.length > index
                                ? "bg-white border-white"
                                : activePinField === "pin"
                                  ? "border-white/50"
                                  : "border-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                    <input
                      ref={pinInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setPin(value)
                        setPinError(false)
                      }}
                      onFocus={() => setActivePinField("pin")}
                      className="sr-only"
                      autoComplete="off"
                    />
                  </div>

                  {/* Confirm PIN Field */}
                  <div>
                    <label className="block text-sm text-white/40 mb-3 text-center">
                      {t.setup.confirmPinLabel}
                    </label>
                    <button
                      onClick={() => {
                        setActivePinField("confirm")
                        confirmPinInputRef.current?.focus()
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        activePinField === "confirm"
                          ? pinError
                            ? "border-red-500 bg-red-500/5"
                            : "border-white bg-white/5"
                          : pinError
                            ? "border-red-500/50"
                            : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex justify-center gap-4">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              confirmPin.length > index
                                ? pinError
                                  ? "bg-red-500 border-red-500"
                                  : "bg-white border-white"
                                : activePinField === "confirm"
                                  ? "border-white/50"
                                  : "border-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                    <input
                      ref={confirmPinInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setConfirmPin(value)
                        setPinError(false)
                      }}
                      onFocus={() => setActivePinField("confirm")}
                      className="sr-only"
                      autoComplete="off"
                    />
                  </div>

                  {pinError && (
                    <p className="text-red-400 text-sm text-center animate-in fade-in duration-200">
                      {t.setup.pinMismatch}
                    </p>
                  )}

                  {/* Numeric keypad */}
                  <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (key === null) return
                          const currentValue = activePinField === "pin" ? pin : confirmPin
                          const setValue = activePinField === "pin" ? setPin : setConfirmPin

                          if (key === "del") {
                            setValue(currentValue.slice(0, -1))
                            setPinError(false)
                          } else if (currentValue.length < 4) {
                            setValue(currentValue + key)
                            setPinError(false)
                          }
                        }}
                        disabled={key === null}
                        className={`h-12 rounded-lg text-lg font-medium transition-all ${
                          key === null
                            ? "invisible"
                            : key === "del"
                              ? "bg-white/5 text-white/60 hover:bg-white/10"
                              : "bg-white/10 text-white hover:bg-white/20 active:scale-95"
                        }`}
                      >
                        {key === "del" ? (
                          <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                          </svg>
                        ) : (
                          key
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!pinEnabled && (
                <p className="text-white/40 text-sm text-center">
                  {t.setup.pinOptional}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.setup.back}
              </button>
              <button
                onClick={handlePinNext}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
              >
                {t.setup.next}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === "complete" && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 mx-auto mb-8 border-2 border-white rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t.setup.allSet}
            </h1>
            <p className="text-lg text-white/60 mb-4">
              {t.setup.allSetSubtitle}
            </p>
            {userName && (
              <p className="text-xl text-white mb-8">
                {t.setup.enjoyMessage}, <span className="font-semibold">{userName}</span>!
              </p>
            )}
            {!userName && (
              <p className="text-xl text-white mb-8">
                {t.setup.enjoyMessage}!
              </p>
            )}
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
            >
              {t.setup.finish}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
