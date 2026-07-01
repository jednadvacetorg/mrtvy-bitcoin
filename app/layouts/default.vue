<template>
  <UHeader :ui="{ center: 'gap-2' }">
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-highlighted">
        <span class="text-xl">💀</span>
        <span>Bitcoin je mrtvý</span>
      </NuxtLink>
    </template>

    <template #right>
      <UBadge v-if="priceLabel" color="primary" variant="subtle" size="sm">
        1 BTC = {{ priceLabel }}
      </UBadge>
    </template>
  </UHeader>

  <UMain>
    <slot />
  </UMain>

  <UFooter :ui="{ top: 'py-8', bottom: 'py-6' }">
    <template #top>
      <UContainer>
        <div class="grid gap-8 sm:grid-cols-2 text-sm text-muted">
          <div>
            <p class="font-semibold text-highlighted mb-2">Na webu</p>
            <ul class="space-y-1">
              <li><ULink to="/">Hlavní stránka</ULink></li>
              <li><ULink to="https://www.bitcoinjemrtvy.cz/prohlaseni" target="_blank">Seznam nekrologů</ULink></li>
              <li><ULink to="https://www.bitcoinjemrtvy.cz/embed" target="_blank">Widgety pro web</ULink></li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-highlighted mb-2">Projekt</p>
            <ul class="space-y-1">
              <li><ULink to="https://github.com/adamkolekcz/bitcoinjemrtvy" target="_blank">Zdrojový kód (Adam Kolek)</ULink></li>
              <li><ULink to="https://bitcoindeaths.com" target="_blank">Zdroj dat: Bitcoin Obituaries</ULink></li>
              <li><ULink to="https://jednadvacet.org" target="_blank">Komunita Jednadvacet</ULink></li>
            </ul>
          </div>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-muted">
        Data & překlad © Adam Kolek ·
        <ULink to="https://github.com/adamkolekcz/bitcoinjemrtvy/blob/main/LICENSE" target="_blank">MIT</ULink>
        · UI ve stylu Jednadvacet
      </p>
    </template>
  </UFooter>
</template>

<script setup lang="ts">
// formatCurrency is auto-imported from shared/utils/calculations.ts
const { data } = await useFetch('/api/btc-price', { key: 'btc-price' })
const priceLabel = computed(() =>
  data.value?.priceCzk ? formatCurrency(Math.round(data.value.priceCzk)) : null,
)
</script>
