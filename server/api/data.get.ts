import {
  calculateInvestment,
  calculateCashCounterfactual,
  parseDate,
  INVESTMENT_PER_DEATH_CZK,
  FALLBACK_USD_TO_CZK,
  type DeathEvent,
} from '#shared/utils/calculations'
import { getDeathsData, getPriceData } from '../utils/deaths'

export default defineEventHandler(async () => {
  const { deaths, inflationRates } = await getDeathsData()
  const { priceUsd, usdToCzk, marketCapCzk } = await getPriceData()

  // Fallback: newest death's USD price if live price feeds all failed.
  const newest = deaths[0] as DeathEvent | undefined
  const effectiveUsdPrice = priceUsd ?? newest?.bitcoinPrice ?? 0
  const effectiveUsdToCzk = usdToCzk || FALLBACK_USD_TO_CZK
  const czkToUsd = 1 / effectiveUsdToCzk
  const btcPriceCzk = effectiveUsdPrice * effectiveUsdToCzk

  const investment = calculateInvestment(deaths, INVESTMENT_PER_DEATH_CZK, effectiveUsdPrice, czkToUsd)
  const cash = calculateCashCounterfactual(deaths, INVESTMENT_PER_DEATH_CZK, inflationRates)

  // Chart data: every death as a (date, price) point on the log-scale price curve,
  // ascending by time. Includes the quote/person so the client can show a bubble.
  const chartPoints = deaths
    .filter((d) => d.bitcoinPrice > 0)
    .map((d) => ({
      t: parseDate(d.date).getTime(),
      date: d.date,
      priceUsd: d.bitcoinPrice,
      priceCzk: d.bitcoinPrice * effectiveUsdToCzk,
      person: d.person,
      publicationName: d.publicationName,
      title: d.articleTitle_cs || d.articleTitle,
      quote: d.quote_cs || d.quote || '',
      slug: d.slug,
    }))
    .sort((a, b) => a.t - b.t)

  return {
    numberOfDeaths: deaths.length,
    perDeathCzk: INVESTMENT_PER_DEATH_CZK,
    btcPriceCzk,
    marketCapCzk,
    usdToCzk: effectiveUsdToCzk,
    czkToUsd,
    priceUsd: effectiveUsdPrice,
    inflationRates,
    investment,
    cash,
    chartPoints,
    priceLive: priceUsd !== null,
  }
})
