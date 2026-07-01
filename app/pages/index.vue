<script setup lang="ts">
// Calc helpers (formatCurrency, scaleInvestmentResult, getBitcoinAgeYears, …) and
// the BITCOIN_GENESIS_ISO constant are auto-imported from shared/utils/calculations.ts
const { data } = await useFetch('/api/data', { key: 'data' })

const yearsTracking = getYearsTracking()

// ── Interactive investment amount (client scales server base values) ─────────
const amount = ref(data.value?.perDeathCzk ?? 500)
const factor = computed(() => amount.value / (data.value?.perDeathCzk ?? 500))

const investment = computed(() =>
  data.value ? scaleInvestmentResult(data.value.investment, factor.value) : null,
)
const cash = computed(() =>
  data.value ? scaleCashResult(data.value.cash, factor.value) : null,
)

const lossWord = computed(() =>
  cash.value ? describeLossFraction(Math.abs(cash.value.lossPct)) : '',
)

const marketCapWords = computed(() =>
  data.value?.marketCapCzk ? formatMarketCapWords(data.value.marketCapCzk) : null,
)

function fmt(v: number) {
  return formatCurrency(Math.round(v))
}
function pct(v: number) {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(v)} %`
}

// ── Live bitcoin age counter (client only) ───────────────────────────────────
const genesis = new Date(BITCOIN_GENESIS_ISO)
const now = ref(new Date())
useIntervalFn(() => (now.value = new Date()), 1000)
const btcAge = computed(() => {
  const years = getBitcoinAgeYears(now.value)
  const anniversary = new Date(now.value.getFullYear() - (years > 0 ? 0 : 0), genesis.getMonth(), genesis.getDate())
  // days/h/m/s since the most recent genesis anniversary
  let lastAnniversary = new Date(genesis)
  lastAnniversary.setFullYear(genesis.getFullYear() + years)
  const diff = Math.max(0, now.value.getTime() - lastAnniversary.getTime())
  const days = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { years, days, h, m, s }
})

const statusCards = [
  { icon: 'i-lucide-zap', title: 'Běží nepřetržitě', text: 'Bitcoin funguje bez výpadku 24/7.' },
  { icon: 'i-lucide-globe', title: 'Globální decentralizovaná síť', text: 'Neovládá ji žádná společnost ani stát.' },
  { icon: 'i-lucide-trending-up', title: 'Aktivní vývoj', text: 'Bezpečnost i možnosti se stále zlepšují.' },
]

useSeoMeta({
  title: 'Bitcoin je mrtvý',
  description:
    'Kolikrát byl Bitcoin prohlášen za mrtvý? Sledujeme mediální nekrology a počítáme, kolik byste dnes měli, kdybyste pokaždé nakoupili.',
  ogTitle: 'Bitcoin je mrtvý',
  ogDescription: 'Kolikrát už byl Bitcoin prohlášen za mrtvý — a přesto stále běží.',
})
</script>

<template>
  <div>
    <!-- Hero -->
    <UPageHero
      title="Bitcoin je mrtvý"
      :description="`Již ${yearsTracking} let sledujeme Bitcoin umírat`"
    >
      <template #links>
        <UBadge color="primary" variant="solid" size="xl" class="text-lg">
          {{ data?.numberOfDeaths ?? '—' }}× prohlášen za mrtvý
        </UBadge>
      </template>
    </UPageHero>

    <UContainer class="space-y-16 pb-16">
      <!-- Investment calculator -->
      <UPageSection
        :ui="{ container: 'py-0 gap-8' }"
        title="Co kdybyste investovali pokaždé, když média prohlásila Bitcoin za mrtvý?"
      >
        <UCard>
          <div class="space-y-6">
            <div>
              <div class="flex items-baseline justify-between mb-2">
                <label class="text-sm text-muted">Investice za „úmrtí"</label>
                <span class="font-semibold text-highlighted">{{ fmt(amount) }}</span>
              </div>
              <USlider v-model="amount" :min="1" :max="9999" :step="1" />
              <p class="text-xs text-muted mt-2">{{ data?.numberOfDeaths ?? 0 }} investic celkem</p>
            </div>

            <div v-if="investment" class="grid gap-4 sm:grid-cols-3">
              <div>
                <p class="text-sm text-muted">Celkem investováno</p>
                <p class="text-2xl font-bold text-highlighted">{{ fmt(investment.totalInvested) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted">Aktuální hodnota</p>
                <p class="text-2xl font-bold text-highlighted">{{ fmt(investment.currentValue) }}</p>
                <p class="text-xs text-muted">
                  {{ new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 4 }).format(investment.totalBtc) }} BTC
                </p>
              </div>
              <div>
                <p class="text-sm text-muted">Výnos (ROI)</p>
                <p class="text-2xl font-bold text-primary">{{ pct(investment.roi) }}</p>
              </div>
            </div>
            <USkeleton v-else class="h-20 w-full" />
          </div>
        </UCard>
      </UPageSection>

      <!-- Cash under mattress -->
      <UPageSection
        :ui="{ container: 'py-0 gap-8' }"
        title="A co kdybyste ty peníze místo Bitcoinu uložili pod matraci?"
        :description="cash ? `Naspořené peníze ztratily ${lossWord} kupní síly. Ne Bitcoin, ale koruna pod matrací pomalu umírá — zabíjí ji inflace.` : ''"
      >
        <div v-if="investment && cash" class="grid gap-4 sm:grid-cols-2">
          <UCard>
            <p class="text-sm text-muted">V Bitcoinu</p>
            <p class="text-3xl font-bold text-primary">{{ pct(investment.roi) }}</p>
            <p class="text-lg text-highlighted">{{ fmt(investment.currentValue) }}</p>
          </UCard>
          <UCard>
            <p class="text-sm text-muted">Pod matrací</p>
            <p class="text-3xl font-bold text-error">{{ pct(cash.lossPct) }}</p>
            <p class="text-lg text-highlighted">{{ fmt(cash.realValue) }}</p>
          </UCard>
        </div>
      </UPageSection>

      <!-- Is bitcoin dead? -->
      <UPageSection :ui="{ container: 'py-0 gap-8' }" title="Je Bitcoin mrtvý?">
        <div class="prose dark:prose-invert max-w-none">
          <p>
            <strong>Ne</strong>, Bitcoin není mrtvý. Byl prohlášen médii za mrtvý více než
            <strong>{{ data?.numberOfDeaths ?? '—' }}×</strong>, přesto však nadále funguje 24 hodin
            denně, 7 dní v týdnu. Bitcoin neumírá. Naopak, <strong>vzkvétá</strong>.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 mt-4">
          <UCard>
            <p class="text-sm text-muted">Jak dlouho žije Bitcoin?</p>
            <ClientOnly>
              <p class="text-2xl font-bold text-highlighted tabular-nums">
                {{ btcAge.years }} let, {{ btcAge.days }}d {{ btcAge.h }}h {{ btcAge.m }}m {{ btcAge.s }}s
              </p>
              <template #fallback>
                <p class="text-2xl font-bold text-highlighted">—</p>
              </template>
            </ClientOnly>
            <p class="text-xs text-muted">Od 3. ledna 2009</p>
          </UCard>
          <UCard v-if="marketCapWords">
            <p class="text-sm text-muted">Hodnota všech bitcoinů v oběhu</p>
            <p class="text-2xl font-bold text-highlighted">{{ fmt(data!.marketCapCzk!) }}</p>
            <p class="text-xs text-muted">{{ marketCapWords }}</p>
          </UCard>
        </div>
      </UPageSection>

      <!-- Current status -->
      <UPageSection
        :ui="{ container: 'py-0 gap-8' }"
        title="Aktuální stav: Živý a aktivní"
      >
        <UPageGrid>
          <UPageCard
            v-for="card in statusCards"
            :key="card.title"
            :icon="card.icon"
            :title="card.title"
            :description="card.text"
          />
        </UPageGrid>
      </UPageSection>

      <!-- CTA to Brno events + community (replaces affiliate links) -->
      <UPageSection :ui="{ container: 'py-0 gap-8' }" title="Chceš víc než jen graf?">
        <div class="grid gap-4 sm:grid-cols-2">
          <UPageCard
            icon="i-lucide-calendar-heart"
            title="Přijď na sraz v Brně"
            description="Potkej bitcoinery naživo na pravidelných srazech Bitcoin Brno."
            to="https://bitcoinbrno.cz"
            target="_blank"
          />
          <UPageCard
            icon="i-lucide-users"
            title="Poznej komunitu Jednadvacet"
            description="Blog, komunity a akce po celém Česku na Jednadvacet.org."
            to="https://jednadvacet.org"
            target="_blank"
          />
        </div>
      </UPageSection>

      <!-- Links to original site -->
      <div class="flex flex-wrap justify-center gap-3">
        <UButton
          to="https://www.bitcoinjemrtvy.cz/prohlaseni"
          target="_blank"
          color="neutral"
          variant="subtle"
          icon="i-lucide-list"
        >
          Seznam všech nekrologů
        </UButton>
        <UButton
          to="https://www.bitcoinjemrtvy.cz/embed"
          target="_blank"
          color="neutral"
          variant="subtle"
          icon="i-lucide-code"
        >
          Widgety pro web
        </UButton>
      </div>

      <!-- Credits & disclaimer -->
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Kredit a zdroje"
      >
        <template #description>
          Postaveno na datech z
          <ULink to="https://bitcoindeaths.com" target="_blank" class="underline">Bitcoin Obituaries (bitcoindeaths.com)</ULink>.
          Český překlad a projekt
          <ULink to="https://www.bitcoinjemrtvy.cz" target="_blank" class="underline">bitcoinjemrtvy.cz</ULink>
          od <ULink to="https://www.linkedin.com/in/adamkolek/" target="_blank" class="underline">Adama Koleka</ULink>
          (kód pod licencí MIT). Tato verze je komunitní adaptace ve stylu Jednadvacet.
          <br>
          <span class="text-muted">Není investiční doporučení — web slouží výhradně k edukaci.</span>
        </template>
      </UAlert>
    </UContainer>
  </div>
</template>
