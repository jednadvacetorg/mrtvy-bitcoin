import { applyTranslations, type TranslationMap } from '#shared/utils/translations'
import type { DeathEvent } from '#shared/utils/calculations'

const RAW_BASE = 'https://raw.githubusercontent.com/adamkolekcz/bitcoinjemrtvy/main/src/data'

export interface DeathsData {
  deaths: DeathEvent[]
  inflationRates: Record<string, number>
}

/**
 * Fetch the source data (deaths + Czech translations + CZ inflation) from the
 * bitcoinjemrtvy GitHub repo, apply translations and drop untranslated records.
 * Cached hourly to avoid hammering GitHub.
 */
export const getDeathsData = defineCachedFunction(
  async (): Promise<DeathsData> => {
    const [rawDeaths, translations, inflation, sourceUrls] = await Promise.all([
      $fetch<DeathEvent[]>(`${RAW_BASE}/deaths.json`, { responseType: 'json' }),
      $fetch<TranslationMap>(`${RAW_BASE}/translations-cs.json`, { responseType: 'json' }),
      $fetch<{ rates: Record<string, number> }>(`${RAW_BASE}/inflation-cz.json`, { responseType: 'json' }),
      $fetch<Record<string, string | null>>(`${RAW_BASE}/source-urls.json`, { responseType: 'json' })
        .catch(() => ({}) as Record<string, string | null>),
    ])

    // Attach the original article URL (keyed by the upstream deaths.json `slug`).
    const withSources = rawDeaths.map((d) => {
      const url = sourceUrls?.[d.slug]
      return url ? { ...d, sourceUrl: url } : d
    })

    const deaths = applyTranslations(withSources, translations)
    const inflationRates = inflation?.rates ?? {}
    return { deaths, inflationRates }
  },
  {
    name: 'deaths-data',
    maxAge: 60 * 60,
    getKey: () => 'v3',
  },
)

interface PriceData {
  priceUsd: number | null
  usdToCzk: number
  marketCapCzk: number | null
}

async function fetchBtcUsd(): Promise<number | null> {
  // Kraken → Coinbase → CoinGecko
  try {
    const r = await $fetch<any>('https://api.kraken.com/0/public/Ticker?pair=XBTUSD', {
      signal: AbortSignal.timeout(8000),
    })
    const pair = r?.result && Object.values(r.result)[0] as any
    const price = Number(pair?.c?.[0])
    if (price > 0) return price
  } catch { /* fall through */ }

  try {
    const r = await $fetch<any>('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
      signal: AbortSignal.timeout(8000),
    })
    const price = Number(r?.data?.amount)
    if (price > 0) return price
  } catch { /* fall through */ }

  return null
}

async function fetchUsdToCzk(): Promise<number> {
  try {
    const r = await $fetch<any>('https://api.frankfurter.app/latest?base=USD&symbols=CZK', {
      signal: AbortSignal.timeout(8000),
    })
    const rate = Number(r?.rates?.CZK)
    if (rate > 0) return rate
  } catch { /* fall through */ }

  try {
    const r = await $fetch<string>('https://api.cnb.cz/cnbapi/exrates/daily?lang=EN', {
      signal: AbortSignal.timeout(8000),
      responseType: 'json',
    }) as any
    const usd = r?.rates?.find((x: any) => x.currencyCode === 'USD')
    if (usd?.rate > 0) return Number(usd.rate) / Number(usd.amount || 1)
  } catch { /* fall through */ }

  return 20.75 // FALLBACK_USD_TO_CZK
}

async function fetchMarketCapCzk(): Promise<number | null> {
  try {
    const r = await $fetch<any>(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=czk&include_market_cap=true',
      { signal: AbortSignal.timeout(8000) },
    )
    const cap = Number(r?.bitcoin?.czk_market_cap)
    if (cap > 0) return cap
  } catch { /* fall through */ }
  return null
}

export const getPriceData = defineCachedFunction(
  async (): Promise<PriceData> => {
    const [priceUsd, usdToCzk, marketCapCzk] = await Promise.all([
      fetchBtcUsd(),
      fetchUsdToCzk(),
      fetchMarketCapCzk(),
    ])
    return { priceUsd, usdToCzk, marketCapCzk }
  },
  {
    name: 'price-data',
    maxAge: 60 * 60,
    getKey: () => 'v1',
  },
)
