<script lang="ts" setup>
import { LoaderCircle } from 'lucide-vue-next'
import { type Component, computed } from 'vue'

import { useButtonSize } from '#ui/components/button/composables/size'
import { useButtonVariant } from '#ui/components/button/composables/variant'
import {
  type ButtonSize,
  type ButtonVariant,
} from '#ui/components/button/types'

/**
 * The button's options
 */
type ButtonProps = {
  /**
   * What it renders as
   */
  readonly as?: string | Component

  /**
   * How it looks
   */
  readonly variant?: ButtonVariant

  /**
   * How big it is
   */
  readonly size?: ButtonSize

  /**
   * Whether it is turned off
   */
  readonly disabled?: boolean

  /**
   * Whether it is busy
   */
  readonly loading?: boolean

  /**
   * The icon before the text
   */
  readonly icon?: Component

  /**
   * The icon after the text
   */
  readonly iconRight?: Component

  /**
   * What it does in a form
   */
  readonly type?: 'button' | 'submit' | 'reset'

  /**
   * Whether it fills its row
   */
  readonly fullWidth?: boolean

  /**
   * More classes
   */
  readonly class?: string
}

/**
 * The button's options
 */
const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
})

/**
 * The button's events
 */
const emit = defineEmits<{
  /**
   * The button was clicked
   */
  (event: 'click', value: MouseEvent): void
}>()

/**
 * The variant's classes
 */
const { variantClasses } = useButtonVariant(() => props.variant)

/**
 * The size's classes
 */
const { sizeClasses } = useButtonSize(() => props.size)

/**
 * Whether it renders a button
 */
const isButton = computed(() => props.as === 'button')

/**
 * The button's classes
 */
const buttonClasses = computed(() => [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap',
  'rounded-control border leading-body font-medium',
  'transition-[color,background-color,border-color,opacity,box-shadow,scale] duration-160 ease-standard',
  'active:scale-[0.97]',
  'disabled:pointer-events-none disabled:opacity-52',
  ...variantClasses.value,
  sizeClasses.value,
  { 'w-full': props.fullWidth, 'cursor-progress': props.loading },
  props.class,
])

/**
 * Passes on a click
 * @param event The click
 */
const handleClick = (event: MouseEvent): void => {
  if (props.disabled || props.loading) return

  emit('click', event)
}
</script>

<template>
  <component
    :is="props.as"
    :type="isButton ? props.type : undefined"
    :disabled="isButton ? props.disabled || props.loading : undefined"
    :aria-disabled="props.disabled || undefined"
    :aria-busy="props.loading || undefined"
    :class="buttonClasses"
    @click="handleClick"
  >
    <LoaderCircle v-if="props.loading" class="size-4 animate-spin" />
    <component :is="props.icon" v-else-if="props.icon" class="size-4" />
    <slot />
    <component
      :is="props.iconRight"
      v-if="props.iconRight && !props.loading"
      class="size-4"
    />
  </component>
</template>
