// Ported from github.com/adamkolekcz/bitcoinjemrtvy (MIT © Adam Kolek),
// src/lib/calculations.ts. Only the pure functions the homepage needs are kept.

export interface DeathEvent {
  date: string
  bitcoinPrice: number
  articleTitle: string
  articleTitle_cs?: string
  person: string
  publicationName: string
  jobTitle: string
  slug: string
  type: string
  quote?: string
  quote_cs?: string
  sourceUrl?: string
}

export interface InvestmentResult {
  totalInvested: number
  totalBtc: number
  currentValue: number
  roi: number
  numberOfDeaths: number
}

export interface CashCounterfactualResult {
  nominal: number
  realValue: number
  lossPct: number
  latestYear: number
}

export const INVESTMENT_PER_DEATH_CZK = 500
export const FALLBACK_USD_TO_CZK = 20.75

const TRACKING_START = { year: 2010, month: 10, day: 15 }
const BITCOIN_GENESIS = { year: 2009, month: 1, day: 3 }
export const BITCOIN_GENESIS_ISO = '2009-01-03T18:15:05Z'

export function getYearsTracking(now: Date = new Date()): number {
  let years = now.getFullYear() - TRACKING_START.year
  const anniversary = new Date(now.getFullYear(), TRACKING_START.month - 1, TRACKING_START.day)
  if (now < anniversary) years--
  return years
}

export function getBitcoinAgeYears(now: Date = new Date()): number {
  let years = now.getFullYear() - BITCOIN_GENESIS.year
  const anniversary = new Date(now.getFullYear(), BITCOIN_GENESIS.month - 1, BITCOIN_GENESIS.day)
  if (now < anniversary) years--
  return years
}

export function parseDate(dateStr: string): Date {
  const [month, day, year] = (dateStr ?? '').split('/').map(Number)
  return new Date(year || 1970, (month || 1) - 1, day || 1)
}

export function formatCzechDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatCurrency(value: number, currency: string = 'CZK'): string {
  if (currency === 'CZK') {
    const formatted = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(value)
    return `${formatted} Kč`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function calculateInvestment(
  deaths: DeathEvent[],
  investmentPerDeath: number,
  currentBtcPrice: number,
  czkToUsd: number = 0.042,
): InvestmentResult {
  const investmentInUsd = investmentPerDeath * czkToUsd

  let totalBtc = 0
  for (const death of deaths) {
    if (death.bitcoinPrice > 0) {
      totalBtc += investmentInUsd / death.bitcoinPrice
    }
  }

  const currentValueUsd = totalBtc * currentBtcPrice
  const currentValueCzk = currentValueUsd / czkToUsd
  const totalInvested = deaths.length * investmentPerDeath
  const roi = totalInvested > 0 ? ((currentValueCzk - totalInvested) / totalInvested) * 100 : 0

  return {
    totalInvested,
    totalBtc,
    currentValue: currentValueCzk,
    roi,
    numberOfDeaths: deaths.length,
  }
}

/** Linearly scale a base investment result to a different per-death amount. ROI is a ratio → unchanged. */
export function scaleInvestmentResult(base: InvestmentResult, factor: number): InvestmentResult {
  return {
    totalInvested: base.totalInvested * factor,
    totalBtc: base.totalBtc * factor,
    currentValue: base.currentValue * factor,
    roi: base.roi,
    numberOfDeaths: base.numberOfDeaths,
  }
}

/** Cumulative CPI index from annual inflation rates (%). Base = first year = 100. */
export function buildCpiIndex(rates: Record<string, number>): Record<number, number> {
  const years = Object.keys(rates)
    .map(Number)
    .sort((a, b) => a - b)
  const index: Record<number, number> = {}
  let acc = 100
  years.forEach((yr, i) => {
    if (i === 0) acc = 100
    else acc *= 1 + rates[String(yr)]! / 100
    index[yr] = acc
  })
  return index
}

export function calculateCashCounterfactual(
  deaths: DeathEvent[],
  perDepositCzk: number,
  rates: Record<string, number>,
  options: { estimateRate?: number; now?: Date } = {},
): CashCounterfactualResult {
  const estimateRate = options.estimateRate ?? 2.5
  const now = options.now ?? new Date()

  const cpi = buildCpiIndex(rates)
  const tableYears = Object.keys(cpi).map(Number)
  const minYear = Math.min(...tableYears)
  const lastTableYear = Math.max(...tableYears)

  const latestYear = Math.max(lastTableYear, now.getFullYear())
  for (let y = lastTableYear + 1; y <= latestYear; y++) {
    cpi[y] = cpi[y - 1]! * (1 + estimateRate / 100)
  }
  const cpiLatest = cpi[latestYear]!

  let realValue = 0
  for (const death of deaths) {
    const eventYear = parseDate(death.date).getFullYear()
    const clampedYear = Math.min(Math.max(eventYear, minYear), latestYear)
    realValue += perDepositCzk * (cpi[clampedYear]! / cpiLatest)
  }

  const nominal = deaths.length * perDepositCzk
  const lossPct = nominal > 0 ? ((realValue - nominal) / nominal) * 100 : 0

  return { nominal, realValue, lossPct, latestYear }
}

export function scaleCashResult(base: CashCounterfactualResult, factor: number): CashCounterfactualResult {
  return {
    nominal: base.nominal * factor,
    realValue: base.realValue * factor,
    lossPct: base.lossPct,
    latestYear: base.latestYear,
  }
}

/** Word description of purchasing-power loss (accusative), e.g. "více než čtvrtinu". */
export function describeLossFraction(absLossPct: number): string {
  const fractions = [
    { pct: 10, word: 'desetinu' },
    { pct: 20, word: 'pětinu' },
    { pct: 25, word: 'čtvrtinu' },
    { pct: 100 / 3, word: 'třetinu' },
    { pct: 50, word: 'polovinu' },
  ]
  let nearest = fractions[0]!
  for (const f of fractions) {
    if (Math.abs(absLossPct - f.pct) < Math.abs(absLossPct - nearest.pct)) nearest = f
  }
  const diff = absLossPct - nearest.pct
  if (Math.abs(diff) <= 2) return nearest.word
  return diff > 0 ? `více než ${nearest.word}` : `téměř ${nearest.word}`
}

/** Break a large CZK amount into Czech magnitude words (biliony/miliardy/miliony/tisíc/koruny). */
export function formatMarketCapWords(value: number): string {
  const units: { value: number; forms: [string, string, string] }[] = [
    { value: 1e12, forms: ['bilion', 'biliony', 'bilionů'] },
    { value: 1e9, forms: ['miliarda', 'miliardy', 'miliard'] },
    { value: 1e6, forms: ['milion', 'miliony', 'milionů'] },
    { value: 1e3, forms: ['tisíc', 'tisíce', 'tisíc'] },
    { value: 1, forms: ['koruna', 'koruny', 'korun'] },
  ]
  const plural = (n: number, forms: [string, string, string]) => {
    if (n === 1) return forms[0]
    if (n >= 2 && n <= 4) return forms[1]
    return forms[2]
  }
  let remaining = Math.floor(value)
  const parts: string[] = []
  for (const unit of units) {
    const count = Math.floor(remaining / unit.value)
    if (count > 0) {
      parts.push(`${new Intl.NumberFormat('cs-CZ').format(count)} ${plural(count, unit.forms)}`)
      remaining -= count * unit.value
    }
  }
  return parts.join(' ') || '0 korun'
}
