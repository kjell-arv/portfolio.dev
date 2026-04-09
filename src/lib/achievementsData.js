import { translations } from '../i18n/translations.js'

export function getAchievementHighlights(locale) {
  const bundle = translations[locale] || translations.en
  return bundle.achievements.highlights
}

export function getAchievementCategories(locale) {
  const bundle = translations[locale] || translations.en
  return bundle.achievements.categories
}
