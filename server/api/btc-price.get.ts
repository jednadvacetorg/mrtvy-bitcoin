import { FALLBACK_USD_TO_CZK } from '#shared/utils/calculations'
import { getDeathsData, getPriceData } from '../utils/deaths'

export default defineEventHandler(async () => {
  const { priceUsd, usdToCzk } = await getPriceData()
  if (priceUsd !== null) {
    return { priceCzk: priceUsd * (usdToCzk || FALLBACK_USD_TO_CZK) }
  }
  const { deaths } = await getDeathsData()
  const newest = deaths[0]
  return { priceCzk: (newest?.bitcoinPrice ?? 0) * (usdToCzk || FALLBACK_USD_TO_CZK) }
})
