import {
  calculateInvestment,
  calculateCashCounterfactual,
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

  return {
    numberOfDeaths: deaths.length,
    perDeathCzk: INVESTMENT_PER_DEATH_CZK,
    btcPriceCzk,
    marketCapCzk,
    usdToCzk: effectiveUsdToCzk,
    investment,
    cash,
    priceLive: priceUsd !== null,
  }
})
