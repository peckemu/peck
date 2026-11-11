<script lang="ts" setup>
import { computed } from 'vue'

/**
 * The meter's options
 */
type MeterProps = {
  /**
   * How full it is
   */
  readonly value: number

  /**
   * The full amount
   */
  readonly max?: number
}

/**
 * The meter's options
 */
const props = withDefaults(defineProps<MeterProps>(), {
  max: 100,
})

/**
 * How full it is in percent
 */
const percent = computed(() =>
  props.max > 0
    ? Math.min(100, Math.max(0, Math.round((props.value / props.max) * 100)))
    : 0,
)
</script>

<template>
  <span
    role="meter"
    :aria-valuenow="props.value"
    :aria-valuemax="props.max"
    aria-valuemin="0"
    class="block h-1.5 overflow-hidden rounded-full bg-surface-muted"
  >
    <span
      class="block h-full rounded-full bg-foreground transition-[width] duration-480 ease-standard"
      :style="{ width: `${percent}%` }"
    />
  </span>
</template>
