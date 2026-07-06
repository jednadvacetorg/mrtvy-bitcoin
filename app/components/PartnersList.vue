<script setup lang="ts">
/**
 * PartnersList
 *
 * Renders the "Partneři Jednadvacet" affiliate logos.
 *
 * Logos are stored inline as self-contained SVG strings. This is a deliberate
 * choice so the component is self-contained and easy to move into the shared
 * layer (github:jednadvacetorg/website) later.
 *
 * Native vector logos (Trezor, BTC Prague) are inlined as their real <svg>
 * markup below — crisp, scalable, and truly self-contained.
 *
 * TEMPORARY WORKAROUND: the 6 raster logos (PNG/WebP) have no vector source, so
 * they use `remoteLogo()`, which wraps a remote <image> pointing at the original
 * assets on https://jednadvacet.org. Replace those remote hrefs with
 * local/vendored assets once available.
 *
 * FUTURE (layer + Nuxt Content): to reuse this from the layer while managing
 * the data via Nuxt Content in the web project, turn `partners` into a prop
 * (`defineProps<{ partners: Partner[] }>()`) so the layer owns the component
 * and each consuming app supplies the data. The array below is shaped so it can
 * become that prop with no structural change.
 */

export interface Partner {
  /** Display / brand name (used for a11y). */
  name: string
  /** Outbound affiliate link. */
  href: string
  /** Short Czech caption shown under the logo. */
  caption: string
  /** Self-contained SVG markup for the logo. */
  svg: string
}

/**
 * Wrap a remote raster logo (PNG/WebP, no vector source) in a self-contained
 * SVG using its native aspect ratio. Temporary until assets are vendored.
 */
function remoteLogo(name: string, src: string, w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}" preserveAspectRatio="xMidYMid meet"><image href="${src}" width="${w}" height="${h}" /></svg>`
}


const partners: Partner[] = [
  {
    name: 'Účtovšem',
    href: 'https://uctovsem.cz',
    caption: 'Hledáš účetní?',
    svg: remoteLogo('Účtovšem', 'https://jednadvacet.org/wp-content/uploads/2025/02/UV-LOGO-2-1024x282.png', 1024, 282),
  },
  {
    name: 'Firefish',
    href: 'http://firefish.io/?ref=jednadvacet',
    caption: 'Vyzkoušej Firefish',
    svg: remoteLogo('Firefish', 'https://jednadvacet.org/wp-content/uploads/2025/02/firefish-logo-on-light-background-rgb-1024x228.png', 1024, 228),
  },
  {
    name: 'Trezor',
    href: 'https://affil.trezor.io/aff_c?offer_id=137&aff_id=9775',
    caption: 'Trezor HW Peněženka',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-label="Trezor" viewBox="0 0 1482.1 378.4"><path d="M915.3 115.9h154.8v40.7l-84.2 114.1h84.2v48H915.3v-40.8l84.2-114h-84.2zm522.4 127.7a61 61 0 0 0 39-59.8c0-40.7-28.1-67-69.8-67h-95v201.9h52.5v-68h19.9l37.1 68h60.7zm-37.1-39.9h-36.2V163h36.2c13.6 0 22.6 8.1 22.6 19.9 0 12.7-9 20.8-22.6 20.8m-216.4-90.5c-61.6 0-105 44.3-105 104s44.4 104.2 105 104.2 106-44.4 106-104.1-44.4-104.1-106-104.1m0 161.1c-30.8 0-51.6-23.5-51.6-57 0-34.4 20.8-57 51.6-57s52.5 23.6 52.5 57-21.7 57-52.5 57M743.3 115.9H890V163h-94.2v29.8h91.4V239h-91.4v32.6H890v47.1H743.3zM222.7 87.8c0-48-41.6-87.8-92.3-87.8S38 39.8 38 87.8v28H0v202l130.4 60.6 130.3-60.6v-201h-38zm-137.6 0c0-22.6 19.9-40.7 45.2-40.7s45.3 18 45.3 40.7v28H85.1zm123.1 197.4-77.9 36.2-77.8-36.2V163.9h155.7zm510.7-101.4c0-40.8-28.1-67-69.8-67h-95v201.9h52.5v-68h19.9l37.1 68h60.7l-44.4-75.1a61 61 0 0 0 39-59.8m-76.1 20h-36.2V163h36.2c13.6 0 22.6 8.1 22.6 19.9 0 12.7-9 20.8-22.6 20.8m-276.1-87.8h163.8v48h-56.1v154.8h-52.5V163.9h-55.2z"/></svg>`,
  },
  {
    name: 'Veribi',
    href: 'https://app.veribi.com/signup?invite=9267',
    caption: 'Bitcoin těžba',
    svg: remoteLogo('Veribi', 'https://jednadvacet.org/wp-content/uploads/2025/08/logo_blue_png.png', 1024, 282),
  },
  {
    name: 'Stosuj',
    href: 'https://stosuj.cz/?aff=jednadvacet',
    caption: 'DCA do bitcoinu',
    svg: remoteLogo('Stosuj', 'https://jednadvacet.org/wp-content/uploads/2025/08/Stosuj-logo-base-fullcolor-lightbg-solid-2x-1024x274.png', 1024, 274),
  },
  {
    name: '21energy',
    href: 'https://21energy.com?sca_ref=8362575.HHRDEJ9MRFGkjM',
    caption: 'Domácí těžba',
    svg: remoteLogo('21energy', 'https://jednadvacet.org/wp-content/uploads/2025/03/logo-c_0d8291bd-e7b2-4cca-9581-386c389a3506.png-1024x304.webp', 1024, 304),
  },
  {
    name: 'FixedFloat',
    href: 'https://ff.io/?ref=8cw27hzb',
    caption: 'Směnárna shitcoinů do bitcoinu',
    svg: remoteLogo('FixedFloat', 'https://jednadvacet.org/wp-content/uploads/2025/03/1713956327781-1024x240.png', 1024, 240),
  },
  {
    name: 'BTC Prague',
    href: 'https://btcprg.me/JEDNADVACET',
    caption: 'Podpoř Jednadvacet nákupem vstupenky',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" aria-label="BTC Prague" viewBox="0 0 126 44"><path fill="#1f142c" d="M8.7 5.7q2.6 0 4.2 2.1a8 8 0 0 1 1.7 5.1 8 8 0 0 1-1.7 5.1 5 5 0 0 1-7.3 1 7 7 0 0 1-1.9-3.1v3.9H0V0h3.6v9.9q.6-2 1.9-3.1a5 5 0 0 1 3.2-1.1m-1.3 11q1.5 0 2.5-1.1t1-2.8A3.6 3.6 0 0 0 7.4 9q-1.6 0-2.7 1.1-1 1-1.1 2.7 0 1.6 1.1 2.8c1.1 1.2 1.6 1.1 2.7 1.1m10.5-7.6h-2.8V6h2.8V2L21.5.9V6h3.6v3.2h-3.6v5.5q0 2 1.9 1.9H25v3.2h-1.6q-2.9 0-4.2-1.3t-1.4-4zm10.4 8.8a7 7 0 0 1-2.1-5.1q0-3 2.1-5.1c2.1-2.1 3.2-2.1 5.2-2.1q2.2 0 4 1.1c1.8 1.1 2.1 1.8 2.6 3.2L36.8 11q-.4-1.1-1.3-1.6T33.6 9q-1.5 0-2.6 1.1-1 1-1 2.7 0 1.6 1 2.8a3.6 3.6 0 0 0 4.6.5q.9-.6 1.3-1.7l3.3 1.1a7 7 0 0 1-2.6 3.2 7 7 0 0 1-4 1.1q-3.2.3-5.3-1.9M8.7 24.4q2.6 0 4.2 2.1a8 8 0 0 1 1.7 5.1 8 8 0 0 1-1.7 5.1 5 5 0 0 1-7.3 1 7 7 0 0 1-1.9-3.1v9.3H0V24.7h3.6v3.9a7 7 0 0 1 1.9-3.1 5 5 0 0 1 3.2-1.1m-1.3 11q1.5 0 2.5-1.1t1-2.8a3.6 3.6 0 0 0-3.5-3.8q-1.6 0-2.7 1.1-1 1-1.1 2.7 0 1.6 1.1 2.8c1.1 1.2 1.6 1.1 2.7 1.1m13-10.7v3.6q.6-2.5 2.1-3.3 1.4-.8 3.1-.3V28q-2.1-.8-3.7.1-1.5.8-1.5 2.6v7.7h-3.6V24.7zm12.2-.3q2.6 0 4.2 1.4t1.6 4v8.7h-3.6V35q-1.1 3.7-4.7 3.7-1.7 0-2.9-1.1a4 4 0 0 1-1.2-2.9q0-3.9 5.3-4.4l2.2-.2q1.3-.1 1.3-1.1 0-.7-.6-1.2t-1.6-.5-1.7.5q-.7.6-.9 1.5l-3.6-.8q.3-1.8 1.9-3a8 8 0 0 1 4.3-1.1m-1.2 11.4q1.4 0 2.4-1t1-2.2v-.3q-.3.3-1.2.4l-2.3.3q-.7.1-1.2.5t-.5 1 .5 1q.6.3 1.3.3m20.3-7.4v-3.8h3.6v12.2a7 7 0 0 1-2.1 5.1 7 7 0 0 1-5.3 2.1 7 7 0 0 1-3.8-1q-1.7-1-2.6-2.7l3.2-1.7q1 2.1 3.2 2.1a4 4 0 0 0 2.7-1.1 4 4 0 0 0 1.1-2.8v-2.6a7 7 0 0 1-1.9 2.9q-1.3 1-3.1 1.1-2.6 0-4.2-2a8 8 0 0 1-1.7-4.9q0-3 1.7-4.9t4.2-2q1.8 0 3.1 1.1 1.2 1 1.9 2.9M48 35q1.5 0 2.6-1c1.1-1 1-1.6 1-2.6q0-1.5-1-2.6c-1-1.1-1.6-1-2.6-1q-1.5 0-2.6 1-1 1-1 2.6 0 1.5 1 2.6 1.1 1 2.6 1m10-2.4v-7.9h3.6v7.9q0 1.2.8 2t2.1.8q1.2 0 2.1-.8.8-.8.8-2v-7.9H71v7.9q0 2.7-1.8 4.4a7 7 0 0 1-4.6 1.7q-2.8 0-4.6-1.7a5 5 0 0 1-2-4.4m22.3-8.2q3.5 0 5.6 2.5a7 7 0 0 1 1.5 5.9H76.8q.3 1.2 1.4 2a4 4 0 0 0 2.4.8q2.4 0 3.4-1.9l3 1.3q-1 1.6-2.6 2.7a7 7 0 0 1-3.9 1 7 7 0 0 1-5.2-2.1 7 7 0 0 1-2.1-5.1 7 7 0 0 1 7.1-7.1m0 3.1q-1.2 0-2.1.7t-1.3 1.9h7q-.3-1.2-1.3-1.9t-2.3-.7"/><g fill="#f28a48"><path d="M51.7 3.7c4 0 7.3 3.3 7.3 7.3s-3.3 7.3-7.3 7.3-7.3-3.3-7.3-7.3 3.3-7.3 7.3-7.3"/><path d="M51.7 2.1a9 9 0 0 0-9 9c0 4.9 4 9 9 9s9-4 9-9a9 9 0 0 0-9-9"/><path d="M67.9 3.7c4 0 7.3 3.3 7.3 7.3s-3.3 7.3-7.3 7.3-7.3-3.3-7.3-7.3 3.3-7.3 7.3-7.3m0-1.6a9 9 0 0 0-9 9c0 4.9 4 9 9 9s9-4 9-9-4-9-9-9m16.3 1.6c4 0 7.3 3.3 7.3 7.3s-3.3 7.3-7.3 7.3-7.3-3.3-7.3-7.3 3.2-7.3 7.3-7.3"/><path d="M84.2 2.1a9 9 0 0 0-9 9c0 4.9 4 9 9 9s9-4 9-9a9 9 0 0 0-9-9"/><path d="M100.4 3.7c4 0 7.3 3.3 7.3 7.3s-3.3 7.3-7.3 7.3-7.3-3.3-7.3-7.3 3.3-7.3 7.3-7.3m0-1.6a9 9 0 0 0-9 9c0 4.9 4 9 9 9s9-4 9-9-4-9-9-9m16.3 1.6c4 0 7.3 3.3 7.3 7.3s-3.3 7.3-7.3 7.3-7.3-3.3-7.3-7.3 3.2-7.3 7.3-7.3"/><path d="M116.7 2.1a9 9 0 0 0-9 9c0 4.9 4 9 9 9s9-4 9-9a9 9 0 0 0-9-9"/></g></svg>`,
  },
]
</script>

<template>
  <ul class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    <li v-for="partner in partners" :key="partner.name">
      <ULink
        :to="partner.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="partner.caption"
        class="group flex h-full flex-col items-center gap-3 rounded-xl bg-white p-6 transition hover:scale-[1.03]"
      >
        <!-- eslint-disable-next-line vue/no-v-html -- trusted, static inline SVG defined above -->
        <!-- text-gray-900 sets currentColor for monochrome logos (e.g. Trezor) on the white tile -->
        <span
          class="flex h-16 w-full items-center justify-center text-gray-900 [&_svg]:h-full [&_svg]:max-w-full [&_svg]:object-contain"
          v-html="partner.svg"
        />
        <span class="text-center text-sm text-muted">{{ partner.caption }}</span>
      </ULink>
    </li>
  </ul>
</template>
