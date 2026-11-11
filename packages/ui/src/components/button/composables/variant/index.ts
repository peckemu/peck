import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

import { type ButtonVariant } from '#ui/components/button/types'

/**
 * The classes for each variant
 */
const VARIANTS: Readonly<Record<ButtonVariant, readonly string[]>> = {
  primary: [
    'border-foreground bg-foreground text-background',
    'hover:opacity-91 hover:shadow-resting active:opacity-84',
  ],
  secondary: [
    'border-border bg-surface text-foreground',
    'hover:bg-surface-muted hover:shadow-resting active:bg-surface-muted',
  ],
  outline: [
    'border-border bg-transparent text-foreground',
    'hover:bg-surface-muted active:bg-surface-muted',
  ],
  ghost: [
    'border-transparent bg-transparent text-secondary',
    'hover:bg-surface-muted hover:text-foreground active:text-foreground',
  ],
  danger: [
    'border-border bg-surface text-danger',
    'hover:border-danger hover:bg-surface-muted',
  ],
  success: [
    'border-success bg-success text-background',
    'hover:opacity-91 hover:shadow-resting active:opacity-84',
  ],
}

/**
 * What the variant composable gives
 */
type UseButtonVariantReturn = {
  /**
   * The variant's classes
   */
  readonly variantClasses: ComputedRef<readonly string[]>
}

/**
 * Finds a button's variant classes
 * @param variant The variant
 * @returns The classes
 */
export const useButtonVariant = (
  variant: MaybeRefOrGetter<ButtonVariant>,
): UseButtonVariantReturn => ({
  variantClasses: computed(() => VARIANTS[toValue(variant)]),
})
