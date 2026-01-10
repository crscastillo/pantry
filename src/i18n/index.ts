import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
}

// Get saved language from localStorage or detect from browser
const savedLanguage = localStorage.getItem('language')
const browserLanguage = navigator.language.split('-')[0] // Get 'en' from 'en-US'
const defaultLanguage = savedLanguage || (browserLanguage in resources ? browserLanguage : 'en')

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
