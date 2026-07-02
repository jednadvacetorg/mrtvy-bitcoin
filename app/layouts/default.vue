<template>
  <!-- Navigation lives inside the hero (see pages/index.vue), so no header here. -->
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


