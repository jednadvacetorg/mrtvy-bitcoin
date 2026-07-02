<script setup lang="ts">
export interface ChartPoint {
  t: number
  date: string
  priceUsd: number
  priceCzk: number
  person: string
  publicationName: string
  title: string
  quote: string
  slug: string
}

const props = defineProps<{
  points: ChartPoint[]
  modelValue?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [index: number]
}>()

// ── Geometry ─────────────────────────────────────────────────────────────────
const W = 1000
const H = 320
const PAD = { top: 24, right: 16, bottom: 24, left: 16 }

const sorted = computed(() => props.points ?? [])

const bounds = computed(() => {
  const pts = sorted.value
  if (pts.length === 0) return { tMin: 0, tMax: 1, logMin: 0, logMax: 1 }
  const tMin = pts[0]!.t
  const tMax = pts[pts.length - 1]!.t
  const prices = pts.map((p) => Math.max(p.priceUsd, 0.0001))
  const logMin = Math.log10(Math.min(...prices))
  const logMax = Math.log10(Math.max(...prices))
  return { tMin, tMax, logMin, logMax: logMax === logMin ? logMin + 1 : logMax }
})

function xOf(t: number) {
  const { tMin, tMax } = bounds.value
  const frac = tMax === tMin ? 1 : (t - tMin) / (tMax - tMin)
  return PAD.left + frac * (W - PAD.left - PAD.right)
}
function yOf(priceUsd: number) {
  const { logMin, logMax } = bounds.value
  const frac = (Math.log10(Math.max(priceUsd, 0.0001)) - logMin) / (logMax - logMin)
  return H - PAD.bottom - frac * (H - PAD.top - PAD.bottom)
}

const linePath = computed(() => {
  const pts = sorted.value
  if (pts.length === 0) return ''
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.t).toFixed(1)},${yOf(p.priceUsd).toFixed(1)}`)
    .join(' ')
})

const areaPath = computed(() => {
  const pts = sorted.value
  if (pts.length === 0) return ''
  const line = pts.map((p) => `L${xOf(p.t).toFixed(1)},${yOf(p.priceUsd).toFixed(1)}`).join(' ')
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  return `M${xOf(first.t).toFixed(1)},${(H - PAD.bottom).toFixed(1)} ${line.slice(1)} L${xOf(last.t).toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z`
})

// Log-scale gridlines at each power of 10 inside the range.
const gridLines = computed(() => {
  const { logMin, logMax } = bounds.value
  const lines: { y: number; label: string }[] = []
  for (let e = Math.ceil(logMin); e <= Math.floor(logMax); e++) {
    const price = 10 ** e
    lines.push({ y: yOf(price), label: '$' + new Intl.NumberFormat('en-US', { notation: 'compact' }).format(price) })
  }
  return lines
})

const selected = computed({
  get: () => props.modelValue ?? sorted.value.length - 1,
  set: (i: number) => emit('update:modelValue', i),
})

function select(i: number) {
  selected.value = i
}
</script>

<template>
  <div class="w-full">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full h-auto select-none"
      preserveAspectRatio="none"
      role="img"
      aria-label="Logaritmický graf ceny Bitcoinu s vyznačenými předpověďmi smrti"
    >
      <defs>
        <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--ui-primary)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--ui-primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- log gridlines -->
      <g>
        <line
          v-for="g in gridLines"
          :key="g.label"
          :x1="PAD.left"
          :x2="W - PAD.right"
          :y1="g.y"
          :y2="g.y"
          stroke="currentColor"
          stroke-opacity="0.12"
          stroke-dasharray="3 4"
        />
        <text
          v-for="g in gridLines"
          :key="g.label + '-t'"
          :x="PAD.left + 2"
          :y="g.y - 3"
          class="fill-current text-[11px] opacity-40"
        >
          {{ g.label }}
        </text>
      </g>

      <!-- price curve -->
      <path :d="areaPath" fill="url(#priceArea)" />
      <path :d="linePath" fill="none" stroke="var(--ui-primary)" stroke-width="2" />

      <!-- death bubbles -->
      <g v-for="(p, i) in sorted" :key="p.slug">
        <circle
          :cx="xOf(p.t)"
          :cy="yOf(p.priceUsd)"
          :r="i === selected ? 6 : 3"
          :fill="i === selected ? 'var(--ui-primary)' : 'var(--ui-bg)'"
          stroke="var(--ui-primary)"
          :stroke-width="i === selected ? 2 : 1.5"
          class="cursor-pointer transition-all"
          @click="select(i)"
        />
        <!-- larger invisible hit target -->
        <circle
          :cx="xOf(p.t)"
          :cy="yOf(p.priceUsd)"
          r="10"
          fill="transparent"
          class="cursor-pointer"
          @click="select(i)"
        />
      </g>
    </svg>
  </div>
</template>
