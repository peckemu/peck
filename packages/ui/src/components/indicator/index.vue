<script lang="ts" setup>
/**
 * The kinds of indicator
 */
type IndicatorTone = 'success' | 'warning' | 'muted'

/**
 * The indicator's options
 */
type IndicatorProps = {
  /**
   * Its colour
   */
  readonly tone?: IndicatorTone

  /**
   * Whether it pulses
   */
  readonly pulse?: boolean
}

/**
 * The indicator's options
 */
const props = withDefaults(defineProps<IndicatorProps>(), {
  tone: 'muted',
  pulse: false,
})

/**
 * The colour for each kind
 */
const TONES: Readonly<Record<IndicatorTone, string>> = {
  success: 'bg-success',
  warning: 'bg-amber-400',
  muted: 'bg-muted',
}
</script>

<template>
  <span class="relative flex size-2 shrink-0">
    <span
      v-if="props.pulse"
      class="absolute inline-flex size-full animate-ping rounded-full opacity-60"
      :class="TONES[props.tone]"
    />
    <span
      class="relative inline-flex size-2 rounded-full"
      :class="TONES[props.tone]"
    />
  </span>
</template>
