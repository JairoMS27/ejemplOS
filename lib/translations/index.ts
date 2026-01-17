import { en } from "./en"
import { es } from "./es"

export type Language = "en" | "es"
export type Translations = typeof en

export const translations: Record<Language, Translations> = {
  en,
  es,
}

export { en, es }
