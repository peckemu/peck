<script lang="ts" setup>
/**
 * The stat's options
 */
type StatProps = {
  /**
   * What it counts
   */
  readonly label: string

  /**
   * The count
   */
  readonly value: string | number

  /**
   * Text after the count
   */
  readonly suffix?: string
}

/**
 * The stat's options
 */
const props = defineProps<StatProps>()
</script>

<template>
  <div class="p-5">
    <dt class="text-xs text-muted">{{ props.label }}</dt>
    <dd class="mt-2 text-2xl font-semibold tabular-nums">
      {{ props.value
      }}<span v-if="props.suffix" class="text-muted">{{ props.suffix }}</span>
    </dd>
  </div>
</template>
