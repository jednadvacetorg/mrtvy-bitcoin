<template>
  <UApp :locale="cs">
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { cs } from '@nuxt/ui/locale'

useHead({
  htmlAttrs: {
    lang: 'cs',
  },
  titleTemplate: (title) => (title ? `${title} | Bitcoin je mrtvý` : 'Bitcoin je mrtvý'),
})
</script>
