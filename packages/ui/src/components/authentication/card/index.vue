<script lang="ts" setup>
/**
 * The card's options
 */
type AuthenticationCardProps = {
  /**
   * Its title
   */
  readonly title?: string

  /**
   * The line under the title
   */
  readonly subtitle?: string
}

/**
 * The card's options
 */
const props = defineProps<AuthenticationCardProps>()
</script>

<template>
  <div
    class="w-[min(100%,420px)] min-w-0 overflow-hidden rounded-surface border border-border bg-surface shadow-resting"
  >
    <div class="grid min-w-0 p-8">
      <div class="mb-6 grid gap-2">
        <h2
          class="font-display text-[2.25rem] leading-display font-normal tracking-display text-balance"
        >
          {{ props.title }}
        </h2>
        <p class="text-sm leading-body text-pretty text-secondary">
          {{ props.subtitle }}
        </p>
      </div>

      <slot />
    </div>

    <slot name="footer" />
  </div>
</template>
