<script lang="ts" setup>
import { CircleAlert, CircleCheck, Info } from 'lucide-vue-next'
import { type Component, computed } from 'vue'

/**
 * The kinds of message
 */
type StatusTone = 'error' | 'success' | 'info'

/**
 * The status options
 */
type StatusProps = {
  /**
   * What it says
   */
  readonly message: string

  /**
   * What kind it is
   */
  readonly tone?: StatusTone
}

/**
 * The status options
 */
const props = withDefaults(defineProps<StatusProps>(), {
  tone: 'error',
})

/**
 * The icon for each kind
 */
const ICONS: Readonly<Record<StatusTone, Component>> = {
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
}

/**
 * The colours for each kind
 */
const TONES: Readonly<Record<StatusTone, string>> = {
  error:
    'border-[color-mix(in_oklab,var(--danger)_30%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_6%,var(--surface))] text-danger',
  success:
    'border-[color-mix(in_oklab,var(--success)_30%,var(--border))] bg-[color-mix(in_oklab,var(--success)_6%,var(--surface))] text-success',
  info: 'border-border bg-surface-muted text-secondary',
}

/**
 * The status icon
 */
const icon = computed(() => ICONS[props.tone])
</script>

<template>
  <div
    :role="props.tone === 'error' ? 'alert' : 'status'"
    class="flex items-start gap-2.5 rounded-control border px-3.5 py-3 text-sm leading-body"
    :class="TONES[props.tone]"
  >
    <component :is="icon" class="mt-0.5 size-4 shrink-0" :stroke-width="1.75" />
    <span class="min-w-0">{{ props.message }}</span>
  </div>
</template>
