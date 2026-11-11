<script lang="ts" setup>
/**
 * The site settings
 */
const config = useRuntimeConfig()
</script>

<template>
  <footer class="border-t border-border">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-muted sm:flex-row sm:justify-between"
    >
      <span>{{ config.public.SITE_NAME }}</span>
      <span>
        Not affiliated with or endorsed by WildWorks. Animal Jam is their
        trademark.
      </span>
    </div>
  </footer>
</template>
