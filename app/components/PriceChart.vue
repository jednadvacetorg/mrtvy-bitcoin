<script setup lang="ts">
export interface ChartPoint {
  t: number
  date: string
  priceUsd: number
  priceCzk: number
  person: string
  publicationName: string
  jobTitle?: string
  title: string
  quote: string
  sourceUrl?: string
}

const props = defineProps<{
  points: ChartPoint[]
  modelValue?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [index: number]
  open: []
}>()

// ── Geometry ─────────────────────────────────────────────────────────────────
const W = 1000
const H = 320
const PAD = { top: 24, right: 16, bottom: 30, left: 16 }

const svgRef = ref<SVGSVGElement | null>(null)

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

// Year ticks along the x-axis, auto-thinned so labels don't overlap.
const yearTicks = computed(() => {
  const { tMin, tMax } = bounds.value
  if (tMax <= tMin) return []
  const firstYear = new Date(tMin).getUTCFullYear()
  const lastYear = new Date(tMax).getUTCFullYear()
  const years: number[] = []
  for (let y = firstYear; y <= lastYear; y++) years.push(y)

  // Estimate how many labels fit: ~40 viewBox units per "2026".
  const avail = W - PAD.left - PAD.right
  const maxLabels = Math.max(1, Math.floor(avail / 40))
  const step = Math.max(1, Math.ceil(years.length / maxLabels))

  return years
    .filter((_, i) => i % step === 0)
    .map((year) => ({ year, x: xOf(Date.UTC(year, 0, 1)) }))
})

const selected = computed({
  get: () => props.modelValue ?? sorted.value.length - 1,
  set: (i: number) => emit('update:modelValue', i),
})

function select(i: number) {
  selected.value = i
}

// Pick the datapoint nearest to the pointer's x position.
function pickNearest(e: PointerEvent | MouseEvent) {
  const pts = sorted.value
  const svg = svgRef.value
  if (!svg || pts.length === 0) return
  const rect = svg.getBoundingClientRect()
  if (rect.width === 0) return
  // preserveAspectRatio="none" → x scales purely by width.
  const svgX = ((e.clientX - rect.left) / rect.width) * W

  let bestIdx = 0
  let bestDist = Infinity
  for (let i = 0; i < pts.length; i++) {
    const d = Math.abs(xOf(pts[i]!.t) - svgX)
    if (d < bestDist) {
      bestDist = d
      bestIdx = i
    }
  }
  if (bestIdx !== selected.value) select(bestIdx)
}

// Pointer down: always select the nearest point. On a real mouse click,
// also open the article popup. Touch taps and pen taps only select.
function onPointerDown(e: PointerEvent) {
  pickNearest(e)
  if (e.pointerType === 'mouse') emit('open')
}

const selectedPoint = computed(() => sorted.value[selected.value] ?? null)
// selectedPoint drives the in-chart vertical marker + dot highlight.
</script>

<template>
  <div class="w-full text-black dark:text-white">
    <svg
      ref="svgRef"
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full h-auto select-none cursor-pointer"
      preserveAspectRatio="none"
      role="img"
      aria-label="Logaritmický graf ceny Bitcoinu; přejeď kurzorem pro výběr nejbližší předpovědi smrti, klikni pro zobrazení článku"
      style="touch-action: none"
      @pointermove="pickNearest"
      @pointerdown="onPointerDown"
    >
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

      <!-- year labels (x-axis) -->
      <g>
        <text
          v-for="tick in yearTicks"
          :key="tick.year"
          :x="tick.x"
          :y="H - 8"
          text-anchor="middle"
          class="fill-current text-[11px] opacity-50"
        >
          {{ tick.year }}
        </text>
      </g>

      <!-- vertical marker for the selected point -->
      <line
        v-if="selectedPoint"
        :x1="xOf(selectedPoint.t)"
        :x2="xOf(selectedPoint.t)"
        :y1="PAD.top"
        :y2="H - PAD.bottom"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-opacity="0.7"
      />

      <!-- price curve -->
      <path :d="linePath" fill="none" stroke="currentColor" stroke-width="2" />

      <!-- datapoints -->
      <g class="pointer-events-none">
        <circle
          v-for="(p, i) in sorted"
          :key="p.t"
          :cx="xOf(p.t)"
          :cy="yOf(p.priceUsd)"
          :r="i === selected ? 6 : 3"
          :fill="i === selected ? 'currentColor' : 'var(--ui-bg)'"
          stroke="currentColor"
          :stroke-width="i === selected ? 2 : 1.5"
          class="transition-all"
        />
      </g>
    </svg>
  </div>
</template>
