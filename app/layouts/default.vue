<template>
  <UHeader :ui="{ center: 'gap-2' }">
    <template #left>
      <div />
    </template>

    <UNavigationMenu :items="menuItems" />

    <template #body>
      <UNavigationMenu :items="menuItems" orientation="vertical" class="-mx-2.5" />
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
              <li><ULink to="https://bitcoinbrno.cz" target="_blank">Komunita Bitcoin Brno</ULink></li>
              <li><ULink to="https://jednadvacet.org" target="_blank">Komunita Jednadvacet</ULink></li>
            </ul>
          </div>
        </div>
      </UContainer>
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

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
</script>
