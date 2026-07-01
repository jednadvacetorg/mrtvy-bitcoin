# TODO — feature backlog

Full port of [bitcoinjemrtvy.cz](https://www.bitcoinjemrtvy.cz) into the Jednadvacet
Nuxt style. The first version ships a static-ish homepage; everything below is the
remaining/deferred scope.

## Shipped in v1

- [x] Nuxt 4 project as a **Nuxt Layer** extending `github:jednadvacetorg/website`
- [x] jednadvacet orange theme + `@nuxt/ui` native components
- [x] Data fetched from the bitcoinjemrtvy GitHub repo JSON (deaths, CZ translations, CZ inflation)
- [x] Ported pure calc logic (investment, ROI, cash-under-mattress, CPI, bitcoin age)
- [x] Live BTC price / USD-CZK rate / market cap (Kraken → Coinbase → CoinGecko; Frankfurter → ČNB → 20.75)
- [x] Homepage sections: hero + `N×` counter, interactive investment calculator (slider),
      cash-under-mattress comparison, "Je Bitcoin mrtvý?" + live age counter + market cap,
      current-status cards, two CTA cards (Bitcoin Brno + Jednadvacet), links to original site, credits + disclaimer
- [x] Header BTC price ticker

## Deferred / not yet ported

- [ ] **BTC price chart** with every "death" marked (range 3y/5y/all, linear vs log scale).
      Original uses Recharts (React). Needs a Vue chart lib (e.g. `vue-chartjs`, `unovis`, or `@unovis/vue`)
      wrapped in `<ClientOnly>`. Requires historical price series (currently only per-death snapshot prices exist).
- [ ] **/prohlaseni timeline page** — full chronological list of obituaries with quote + source link.
      (v1 links out to the original site instead.)
- [ ] **/prohlaseni/[slug] detail pages** — per-obituary page (uses `generateDeathSlug`, meta description builder).
- [ ] **/embed widgets** — Death Counter + Stats Card embeddable via `<iframe>`.
- [ ] **Live deaths from bitcoindeaths.com** — original scrapes `bitcoindeaths.com/posts` `__NEXT_DATA__`
      at runtime with fallback to static JSON. v1 uses the repo JSON snapshot only.
- [ ] **source-urls.json join** — attach original article URLs to each death (needed for timeline/detail).
- [ ] **redirects.json** — 301 redirects for legacy CZ→EN slugs.
- [ ] **OG image generation** per page (`og-image.tsx` equivalent) — could use `nuxt-og-image`.
- [ ] **SEO extras** — sitemap, robots, structured data (`nuxt-seo` / `@nuxtjs/sitemap`).
- [ ] **Analytics** — jednadvacet uses Counterscale; wire up if desired.
- [ ] **Automatic Czech translation** pipeline (daily GitHub Action via Claude API) — out of scope for a static consumer.
- [ ] **Unit tests** for ported calc/translation functions (original has `node:test` suites).
- [ ] **Deployment** config (Cloudflare Workers, matching jednadvacet) — currently node preset only.
- [ ] Reuse the base layer's real `AppNavBar`/`AppFooter` once content-collection coupling is resolved
      (v1 ships a local self-contained `default` layout instead).

## Notes / gotchas

- Translations are keyed by `DD-MM-YYYY + slug(ENGLISH title, untruncated)`, NOT by the stored
  `deaths.json` `slug` field (`YYYY-MM-DD`, truncated). See `shared/utils/translations.ts`.
- Recomputed numbers are close to but not byte-identical with the live site (live price differs by the second).
- All death `bitcoinPrice` values are USD; CZK conversion happens only at render time.
