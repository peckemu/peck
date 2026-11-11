<script lang="ts" setup>
/**
 * The card's options
 */
type CardProps = {
  /**
   * Its title
   */
  readonly title?: string

  /**
   * The note beside the title
   */
  readonly note?: string
}

/**
 * The card's options
 */
const props = defineProps<CardProps>()
</script>

<template>
  <div class="overflow-hidden rounded-panel border border-border bg-surface">
    <div
      v-if="props.title"
      class="flex items-center justify-between gap-4 border-b border-border px-5 py-4"
    >
      <h2 class="text-sm">{{ props.title }}</h2>
      <span v-if="props.note" class="text-xs text-muted">
        {{ props.note }}
      </span>
    </div>

    <slot />
  </div>
</template>
