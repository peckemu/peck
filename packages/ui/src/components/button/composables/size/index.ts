import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

import { type ButtonSize } from '#ui/components/button/types'

/**
 * The classes for each size
 */
const SIZES: Readonly<Record<ButtonSize, string>> = {
  xs: 'h-8 px-2.5 text-xs',
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-[3.125rem] px-5 text-sm',
  xl: 'h-14 px-6 text-base',
}

/**
 * What the size composable gives
 */
type UseButtonSizeReturn = {
  /**
   * The size's classes
   */
  readonly sizeClasses: ComputedRef<string>
}

/**
 * Finds a button's size classes
 * @param size The size
 * @returns The classes
 */
export const useButtonSize = (
  size: MaybeRefOrGetter<ButtonSize>,
): UseButtonSizeReturn => ({
  sizeClasses: computed(() => SIZES[toValue(size)]),
})
