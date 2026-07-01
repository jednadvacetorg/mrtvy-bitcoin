// Ported from github.com/adamkolekcz/bitcoinjemrtvy (MIT © Adam Kolek),
// src/lib/translations.ts. Maps English death records → Czech translations.
//
// IMPORTANT: translations are keyed by DD-MM-YYYY + slug(ENGLISH title, UNtruncated),
// which differs from the stored deaths.json `slug` field (YYYY-MM-DD, truncated).

import { parseDate, type DeathEvent } from './calculations'

export interface Translation {
  articleTitle: string
  quote?: string
}

export type TranslationMap = Record<string, Translation>

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function translationKey(death: DeathEvent): string {
  const date = parseDate(death.date)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}-${slugifyTitle(death.articleTitle)}`
}

/**
 * Merge Czech translations onto deaths and drop any death that has no Czech
 * translation (mirrors the live site — untranslated articles never appear).
 */
export function applyTranslations(deaths: DeathEvent[], translations: TranslationMap): DeathEvent[] {
  const result: DeathEvent[] = []
  for (const death of deaths) {
    if (!death?.date || !death.articleTitle) continue
    const t = translations[translationKey(death)]
    if (!t?.articleTitle) continue
    result.push({
      ...death,
      articleTitle_cs: t.articleTitle,
      quote_cs: t.quote,
    })
  }
  return result
}
