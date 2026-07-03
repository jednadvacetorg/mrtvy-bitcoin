<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { ChartPoint } from '~/components/PriceChart.vue'
import type { DeathEvent } from '#shared/utils/calculations'
// Calc helpers and constants are auto-imported from shared/utils/calculations.ts
const { data } = await useFetch('/api/data', { key: 'data' })

const yearsTracking = getYearsTracking()

// ── Navigation (rendered inside the hero) ────────────────────────────────────
const menuOpen = ref(false)
const menuItems: NavigationMenuItem[] = [
  {
    label: 'Kalkulačka',
    description: 'Spočítej, kolik bys dnes měl, kdybys nakoupil při každém „úmrtí".',
    icon: 'i-lucide-calculator',
    to: '/#kalkulacka',
  },
  {
    label: 'Bitcoin Brno',
    description: 'Pravidelné srazy bitcoinové komunity v Brně.',
    icon: 'i-lucide-map-pin',
    to: 'https://bitcoinbrno.cz',
    target: '_blank',
  },
  {
    label: 'Jedenadvacet',
    description: 'Blog, komunity a akce kolem Bitcoinu po celém Česku.',
    icon: 'i-lucide-users',
    to: 'https://jednadvacet.org',
    target: '_blank',
  },
]

// ── Chart + selected obituary ────────────────────────────────────────────────
const chartPoints = computed<ChartPoint[]>(() => (data.value?.chartPoints ?? []) as ChartPoint[])
const selectedIndex = ref<number | null>(null)
const selectedPoint = computed<ChartPoint | null>(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return null
  const i = selectedIndex.value ?? pts.length - 1
  return pts[i] ?? pts[pts.length - 1] ?? null
})

// When the hovered point is on the right half of the chart, place the
// card on the left so it doesn't cover the point being read.
const cardOnLeft = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return false
  const i = selectedIndex.value ?? pts.length - 1
  return i >= pts.length / 2
})

// Full-text obituary popup (opened by clicking the bubble card).
const detailOpen = ref(false)
function openDetail() {
  detailOpen.value = true
}

// ── Calculator mode ──────────────────────────────────────────────────────────
type Mode = 'perDeath' | 'monthly'
const mode = ref<Mode>('perDeath')

const periodYears = ref<number>(DEFAULT_DCA_PERIOD)
const periodItems = DCA_PERIODS_YEARS.map((y) => ({
  label: y < 5 ? `${y} roky` : `${y} let`,
  value: y as number,
}))

// Per-death amount
const perDeathAmount = ref(data.value?.perDeathCzk ?? 500)

// Monthly amount
const monthlyAmount = ref(1000)

// All deaths as DeathEvent[] (only date + price are needed by the calc funcs).
const allDeaths = computed(
  () =>
    chartPoints.value.map((p) => ({
      date: p.date,
      bitcoinPrice: p.priceUsd,
    })) as unknown as DeathEvent[],
)

// Deaths within the selected look-back period (used by per-death mode).
const periodDeaths = computed(() => {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - periodYears.value)
  const cutoffMs = cutoff.getTime()
  return chartPoints.value
    .filter((p) => p.t >= cutoffMs)
    .map((p) => ({ date: p.date, bitcoinPrice: p.priceUsd })) as unknown as DeathEvent[]
})

// ── Investment result (depends on mode + period) ─────────────────────────────
const investment = computed(() => {
  if (!data.value) return null
  if (mode.value === 'perDeath') {
    return calculateInvestment(
      periodDeaths.value,
      perDeathAmount.value,
      data.value.priceUsd,
      data.value.czkToUsd,
    )
  }
  return calculateMonthlyInvestment(
    allDeaths.value,
    monthlyAmount.value,
    periodYears.value,
    data.value.priceUsd,
    data.value.czkToUsd,
  )
})

// ── Cash-under-mattress result (mirrors the calculator input) ────────────────
const cash = computed(() => {
  if (!data.value) return null
  if (mode.value === 'perDeath') {
    return calculateCashCounterfactual(
      periodDeaths.value,
      perDeathAmount.value,
      data.value.inflationRates,
    )
  }
  return calculateMonthlyCashCounterfactual(
    monthlyAmount.value,
    periodYears.value,
    data.value.inflationRates,
  )
})

const lossWord = computed(() =>
  cash.value ? describeLossFraction(Math.abs(cash.value.lossPct)) : '',
)

const investmentCountLabel = computed(() => {
  if (mode.value === 'perDeath') return `${periodDeaths.value.length} investic za období`
  const months = Math.round(periodYears.value * 12)
  return `${months} měsíčních nákupů`
})

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
  let lastAnniversary = new Date(genesis)
  lastAnniversary.setFullYear(genesis.getFullYear() + years)
  const diff = Math.max(0, now.value.getTime() - lastAnniversary.getTime())
  const days = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { years, days, h, m, s }
})

// ── Uptime comparison (replaces market-cap section) ──────────────────────────
// Average Czech bank: estimated 21–92 h of outages per year (planned + unplanned).
// Source: https://www.perplexity.ai/search/kolik-ma-prumerna-ceska-banka-JLmQbHPQS5e0x_PfWadIUA
const BANK_OUTAGE_HOURS_MIN = 21
const BANK_OUTAGE_HOURS_MAX = 92

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
    <!-- Hero: triple black border frame, serif text, log-scale price chart -->
    <section class="font-serif px-1 py-8 sm:px-6 sm:py-10">
      <!-- Outer border (~3px) -->
      <div class="border-[3px] border-black p-0.5">
        <!-- Middle border (~1px) -->
        <div class="border border-black p-0.5">
          <!-- Inner border (~1px) -->
          <div class="relative overflow-hidden border border-black">
            <!-- Top row: image (left) + navbar (right), no border/background, not fixed -->
            <div class="flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-8">
              <!-- Image in the top-left corner; inverts in dark mode only -->
              <NuxtImg
                src="/images/parte-cross.webp"
                alt=""
                aria-hidden="true"
                class="pointer-events-none w-10 shrink-0 select-none sm:w-18 dark:invert"
              />

              <!-- Desktop: menu expands on the right side -->
              <UNavigationMenu :items="menuItems" class="hidden lg:flex" />

              <!-- Mobile: only a burger, opens a slideover -->
              <UButton
                class="lg:hidden"
                color="neutral"
                variant="ghost"
                icon="i-lucide-menu"
                aria-label="Otevřít menu"
                @click="menuOpen = true;"
              />
            </div>

            <USlideover v-model:open="menuOpen" title="Menu">
              <template #body>
                <UNavigationMenu
                  :items="menuItems"
                  orientation="vertical"
                  class="-mx-2.5"
                  @select="menuOpen = false"
                />
              </template>
            </USlideover>

            <UContainer class="relative py-6 sm:py-10">
              <div class="text-center max-w-3xl mx-auto">
                <h1 class="text-4xl sm:text-6xl font-bold text-highlighted tracking-tight">
                  Bitcoin je mrtvý
                </h1>
                <p class="mt-4 text-lg text-muted">
                  Již {{ yearsTracking }} let sledujeme Bitcoin umírat
                </p>
                <div class="mt-6 flex justify-center">
                  <UBadge color="primary" variant="solid" size="xl" class="text-lg font-serif">
                    {{ data?.numberOfDeaths ?? '—' }}× prohlášen za mrtvý
                  </UBadge>
                </div>
              </div>

              <!-- Price chart + latest-death bubble (bottom part of the hero) -->
              <div class="mt-14">
                <ClientOnly>
                  <div class="relative">
                    <PriceChart v-model="selectedIndex" :points="chartPoints" />

                    <!-- selected / latest obituary bubble -->
                    <Transition
                      mode="out-in"
                      enter-active-class="transition duration-200"
                      enter-from-class="opacity-0 translate-y-1"
                    >
                      <UPageCard
                        v-if="selectedPoint"
                        :key="selectedPoint.t"
                        role="button"
                        tabindex="0"
                        :class="[
                          'group mt-4 sm:mt-0 sm:absolute sm:-top-4 sm:max-w-xs cursor-pointer',
                          cardOnLeft ? 'sm:left-0' : 'sm:right-0',
                        ]"
                        :ui="{ root: 'bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none ring-1 ring-black dark:ring-white' }"
                        @click="openDetail"
                        @keydown.enter="openDetail"
                        @keydown.space.prevent="openDetail"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <p class="text-xs text-primary font-semibold uppercase tracking-wide">
                            {{ selectedIndex === null ? 'Poslední předpověď smrti' : 'Předpověď smrti' }}
                          </p>
                          <span class="text-xs text-muted whitespace-nowrap">
                            {{ formatCzechDate(selectedPoint.date) }}
                          </span>
                        </div>
                        <p class="mt-1 text-sm text-highlighted font-medium line-clamp-3">
                          „{{ selectedPoint.quote || selectedPoint.title }}"
                        </p>
                        <p class="mt-2 text-xs text-muted">
                          {{ selectedPoint.person }} · {{ selectedPoint.publicationName }}
                        </p>
                        <div class="flex items-center justify-between gap-2">
                          <p class="text-xs text-muted">
                            cena tehdy {{ fmt(selectedPoint.priceCzk) }}
                          </p>
                          <span class="text-xs text-primary font-semibold underline whitespace-nowrap group-hover:no-underline">
                            celý text
                          </span>
                        </div>
                      </UPageCard>
                    </Transition>

                    <!-- Full-text obituary popup -->
                    <UModal
                      v-model:open="detailOpen"
                      :title="selectedPoint?.person"
                      :description="selectedPoint ? `${selectedPoint.jobTitle ? selectedPoint.jobTitle + ' · ' : ''}${selectedPoint.publicationName} · ${formatCzechDate(selectedPoint.date)}` : ''"
                    >
                      <template #body>
                        <div v-if="selectedPoint" class="space-y-4">
                          <p class="text-xs text-primary font-semibold uppercase tracking-wide">
                            {{ selectedIndex === null ? 'Poslední předpověď smrti' : 'Předpověď smrti' }}
                          </p>
                          <p class="text-base text-highlighted font-medium leading-relaxed">
                            „{{ selectedPoint.quote || selectedPoint.title }}"
                          </p>
                          <p class="text-sm text-muted">
                            {{ selectedPoint.title }}
                          </p>
                          <p class="text-sm text-muted">
                            Cena Bitcoinu tehdy: <span class="font-semibold text-highlighted">{{ fmt(selectedPoint.priceCzk) }}</span>
                          </p>
                          <UButton
                            v-if="selectedPoint.sourceUrl"
                            :to="selectedPoint.sourceUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            trailing-icon="i-lucide-external-link"
                            color="primary"
                            variant="subtle"
                          >
                            Číst originální článek
                          </UButton>
                        </div>
                      </template>
                    </UModal>
                  </div>
                  <p class="mt-3 text-center text-xs text-muted">
                    Logaritmická cenová křivka. Přejeď kurzorem nad grafem a čti tehdejší předpověď.
                  </p>
                  <template #fallback>
                    <USkeleton class="h-80 w-full" />
                  </template>
                </ClientOnly>
              </div>
            </UContainer>
          </div>
        </div>
      </div>
    </section>

    <UContainer class="space-y-16 py-16">
      <!-- Investment calculator (full-bleed below sm) -->
      <UPageSection
        id="kalkulacka"
        :ui="{ container: 'py-0 gap-8' }"
        title="Co kdybyste investovali pokaždé, když média prohlásila Bitcoin za mrtvý?"
      >
        <UCard class="-mx-4 rounded-none sm:mx-0 sm:rounded-[calc(var(--ui-radius)*2)]">
          <div class="space-y-6">
            <!-- mode switch -->
            <UTabs
              :items="[{ label: 'Za každé „úmrtí“', value: 'perDeath' }, { label: 'Jednou měsíčně', value: 'monthly' }]"
              :model-value="mode"
              @update:model-value="(v) => (mode = v as Mode)"
              :content="false"
              color="primary"
            />

            <!-- period switch (both modes) -->
            <div>
              <label class="text-sm text-muted mb-2 block">
                {{ mode === 'monthly' ? 'Časové období' : 'Za jak dlouhé období' }}
              </label>
              <UTabs
                :items="periodItems"
                :model-value="periodYears"
                @update:model-value="(v) => (periodYears = Number(v))"
                :content="false"
                variant="pill"
                size="sm"
              />
            </div>

            <!-- amount slider -->
            <div v-if="mode === 'perDeath'">
              <div class="flex items-baseline justify-between mb-2">
                <label class="text-sm text-muted">Investice za „úmrtí"</label>
                <span class="font-semibold text-highlighted">{{ fmt(perDeathAmount) }}</span>
              </div>
              <USlider v-model="perDeathAmount" :min="1" :max="10000" :step="1" />
            </div>
            <div v-else>
              <div class="flex items-baseline justify-between mb-2">
                <label class="text-sm text-muted">Měsíční investice</label>
                <span class="font-semibold text-highlighted">{{ fmt(monthlyAmount) }}</span>
              </div>
              <USlider v-model="monthlyAmount" :min="100" :max="10000" :step="100" />
            </div>
            <p class="text-xs text-muted">{{ investmentCountLabel }}</p>

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

      <!-- Cash under mattress (mirrors the calculator input above) -->
      <UPageSection
        :ui="{ container: 'py-0 gap-8' }"
        title="A co kdybyste ty peníze místo Bitcoinu uložili pod matraci?"
        :description="cash ? `Naspořené peníze ztratily ${lossWord} kupní síly. Ne Bitcoin, ale koruna pod matrací pomalu umírá — zabíjí ji inflace.` : ''"
      >
        <UCard v-if="investment && cash">
          <div class="grid grid-cols-2 divide-x divide-default">
            <div class="pr-4">
              <p class="text-sm text-muted">V Bitcoinu</p>
              <p class="text-3xl font-bold text-primary">{{ pct(investment.roi) }}</p>
              <p class="text-lg text-highlighted">{{ fmt(investment.currentValue) }}</p>
            </div>
            <div class="pl-4">
              <p class="text-sm text-muted">Pod matrací</p>
              <p class="text-3xl font-bold text-error">{{ pct(cash.lossPct) }}</p>
              <p class="text-lg text-highlighted">{{ fmt(cash.realValue) }}</p>
            </div>
          </div>
        </UCard>
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
          <UCard>
            <p class="text-sm text-muted">Výpadků bitcoinové sítě za rok:</p>
            <p class="text-3xl font-bold text-primary tabular-nums">0 hodin</p>
            <div class="mt-3 rounded-lg bg-error/10 px-3 py-2">
              <p class="text-xs text-muted">Průměrná česká banka pro srovnání:</p>
              <p class="text-xl font-bold text-error tabular-nums">
                {{ BANK_OUTAGE_HOURS_MIN }}–{{ BANK_OUTAGE_HOURS_MAX }} hodin
              </p>
              <p class="text-xs text-muted">plánované odstávky i výpadky dohromady</p>
            </div>
          </UCard>
        </div>
      </UPageSection>

      <!-- Current status -->
      <UPageSection
        :ui="{ container: 'py-0 gap-8' }"
      >
        <template #title>
          <div class="text-base">
            Aktuální stav:
          </div>
          <span class="bg-green-500 rounded-full size-3 mb-1 mr-2 inline-block relative">
            <span class="bg-green-500 rounded-full inline-block animate-ping inset-0 absolute" />
          </span>
          Živý a aktivní
        </template>
        <UPageGrid>
          <UPageCard
            icon="i-lucide-zap"
            title="Běží nepřetržitě"
            description="Bitcoin funguje bez výpadku 24/7."
          />
          <UPageCard
            icon="i-lucide-globe"
            title="Globální decentralizovaná síť"
            description="Neovládá ji žádná společnost ani stát."
          />
          <UPageCard
            icon="i-lucide-trending-up"
            title="Aktivní vývoj"
            description="Bezpečnost i možnosti se stále zlepšují."
          />
        </UPageGrid>
      </UPageSection>

      <!-- Community CTAs (photo as card background) -->
      <div class="space-y-8">
        <!-- Bitcoin Brno -->
        <UPageCTA
          variant="naked"
          title="Přijď na sraz v Brně"
          description="V Brně se pravidelně schází otevřená komunita kolem svobodného vzdělávání, peněz a života. Nemusíš Bitcoinu rozumět – přijď si hlavně popovídat a poznat lidi. Jsi vítán/vítána."
          :links="[{ label: 'bitcoinbrno.cz', to: 'https://bitcoinbrno.cz', target: '_blank', color: 'primary', size: 'lg', trailingIcon: 'i-lucide-arrow-right' }]"
          :ui="{
            root: 'relative isolate overflow-hidden rounded-xl ring ring-default',
            title: 'text-white',
            description: 'text-white/90',
          }"
        >
          <template #top>
            <NuxtImg
              src="/images/brno-piknik.jpg"
              alt="Sraz komunity Bitcoin Brno"
              class="absolute inset-0 -z-10 h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 -z-10 bg-black/40" />
          </template>
        </UPageCTA>

        <!-- Jednadvacet -->
        <!-- TODO: nahradit jednadvacetPhoto vlastní fotkou Jednadvacet. -->
        <UPageCTA
          variant="naked"
          title="Poznej komunitu po celém Česku"
          description="Blog, lokální komunity a akce kolem Bitcoinu, svobodných peněz a zdravého životního stylu. Najdi svoje lidi ve svém městě a přidej se."
          :links="[{ label: 'jednadvacet.org', to: 'https://jednadvacet.org', target: '_blank', color: 'primary', size: 'lg', trailingIcon: 'i-lucide-arrow-right' }]"
          :ui="{
            root: 'relative isolate overflow-hidden rounded-xl ring ring-default',
            title: 'text-white',
            description: 'text-white/90',
          }"
        >
          <template #top>
            <NuxtImg
              src="/images/brno-meetup.jpg"
              alt="Komunita Jednadvacet"
              class="absolute inset-0 -z-10 h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 -z-10 bg-black/40" />
          </template>
        </UPageCTA>
      </div>

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
          <p>
            Inspirace a zdroj dat:
            <ULink to="https://bitcoindeaths.com" target="_blank" class="underline">Bitcoin Obituaries (bitcoindeaths.com)</ULink>.
          </p>
          <p class="mt-2">
            Český překlad:
            <ULink to="https://www.bitcoinjemrtvy.cz" target="_blank" class="underline">bitcoinjemrtvy.cz</ULink>
            od <ULink to="https://www.linkedin.com/in/adamkolek/" target="_blank" class="underline">Adama Koleka</ULink>
            (kód pod licencí MIT).
          </p>
          <p class="mt-2">
            Tuto verzi a kampaň v Brně vytvořili
            <a href="https://honza.poboril.cz" target="_blank" class="underline">Honza</a>,
            <a href="https://www.nogoodkid.com" target="_blank" class="underline">Nogoodkid</a> a
            <a href="https://nktrjsk.cz" target="_blank" class="underline">Nikita</a>.
          </p>
        </template>
      </UAlert>
    </UContainer>
  </div>
</template>
