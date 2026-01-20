"use client"

import { useState } from "react"
import { Check, ChevronRight, ChevronLeft, User, Languages, Palette } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { useI18n } from "@/lib/i18n-context"

interface SetupWizardProps {
  onComplete: () => void
}

type Step = "welcome" | "language" | "user" | "theme" | "complete"

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [userName, setUserName] = useState("")
  const [showGrid, setShowGrid] = useState(true)
  const [showWatermark, setShowWatermark] = useState(true)

  const { updateUser, updateDesktop, completeSetup } = useSettings()
  const { t, language, setLanguage } = useI18n()

  const steps: Step[] = ["welcome", "language", "user", "theme", "complete"]
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

  const handleFinish = () => {
    updateUser({ name: userName || "User" })
    updateDesktop({ showGrid, showWatermark })
    completeSetup()
    onComplete()
  }

  const renderStepIndicator = () => {
    const visibleSteps: Step[] = ["language", "user", "theme"]
    const currentVisibleIndex = visibleSteps.indexOf(currentStep as "language" | "user" | "theme")

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
                    <p className="font-medium text-white">Espanol</p>
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
                {t.setup.userName}
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t.setup.userPlaceholder}
                className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-lg"
                autoFocus
              />
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

        {/* Theme Step */}
        {currentStep === "theme" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
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
            <div className="relative w-full h-40 mb-6 rounded-xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-black" />
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
              {showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white opacity-20">EJ</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 h-4 bg-white/10 rounded" />
            </div>

            <div className="space-y-3 mb-8">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  showGrid
                    ? "bg-white/10 border-white"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="text-white">{t.setup.showGrid}</span>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    showGrid ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform mt-1 ${
                      showGrid ? "translate-x-5 ml-0" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  showWatermark
                    ? "bg-white/10 border-white"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <span className="text-white">{t.setup.showWatermark}</span>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    showWatermark ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform mt-1 ${
                      showWatermark ? "translate-x-5 ml-0" : "translate-x-1"
                    }`}
                  />
                </div>
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
