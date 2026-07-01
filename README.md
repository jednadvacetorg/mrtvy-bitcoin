# Bitcoin je mrtvý 💀 — komunitní verze

Komunitní adaptace projektu [**bitcoinjemrtvy.cz**](https://www.bitcoinjemrtvy.cz)
ve vizuálním stylu [Jednadvacet.org](https://jednadvacet.org).

> Kolikrát už byl Bitcoin prohlášen za mrtvý — a přesto stále běží.

## Co to je

Jednostránkový přehled: kolikrát média prohlásila Bitcoin za mrtvý, kolik byste
dnes měli, kdybyste pokaždé nakoupili, a srovnání s korunou „pod matrací"
užíranou inflací. Místo affiliate odkazů zve na **srazy Bitcoin Brno** a do
**komunity Jednadvacet**.

## Technologický stack

- [Nuxt 4](https://nuxt.com/docs) (Vue 3) + [Nuxt UI](https://ui.nuxt.com/)
- **Nuxt Layers** — projekt dědí styl a konvence z báze `github:jednadvacetorg/website`
  (viz `extends` v `nuxt.config.ts`). Je to samostatný, izolovaný projekt.
- Data se načítají z JSON souborů repozitáře
  [adamkolekcz/bitcoinjemrtvy](https://github.com/adamkolekcz/bitcoinjemrtvy)
  (nekrology, české překlady, česká inflace) a doplňují se živou cenou BTC
  (Kraken → Coinbase → CoinGecko) a kurzem USD/CZK (Frankfurter → ČNB).

## Struktura

```
app/
  app.vue, app.config.ts          # Nuxt UI + orange theme (jednadvacet)
  assets/css/main.css             # tailwind + @nuxt/ui + orange palette
  layouts/default.vue             # header (BTC ticker) + footer
  pages/index.vue                 # celá homepage
shared/utils/
  calculations.ts                 # port výpočtů (MIT © Adam Kolek)
  translations.ts                 # mapování EN nekrolog → CZ překlad
server/
  utils/deaths.ts                 # fetch + cache dat a cen
  api/data.get.ts                 # spočítaný payload pro homepage
  api/btc-price.get.ts            # cena BTC pro ticker
```

## Vývoj

```bash
npm install
npm run dev        # http://localhost:2109
npm run typecheck
```

Repozitář obsahuje předpřipravený **devcontainer** (`.devcontainer/`) shodný
s projektem Jednadvacet.

## Kredit a licence

Data a původní projekt © [Adam Kolek](https://www.linkedin.com/in/adamkolek/),
kód pod [licencí MIT](https://github.com/adamkolekcz/bitcoinjemrtvy/blob/main/LICENSE).
Nekrology pocházejí z [Bitcoin Obituaries (bitcoindeaths.com)](https://bitcoindeaths.com).

> ⚠️ Není investiční doporučení — web slouží výhradně k edukaci.

Chybějící/odložené funkce viz [`TODO.md`](./TODO.md).
