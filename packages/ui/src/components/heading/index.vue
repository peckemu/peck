<script lang="ts" setup>
/**
 * The heading's options
 */
type HeadingProps = {
  /**
   * Its title
   */
  readonly title: string

  /**
   * The line under it
   */
  readonly description?: string
}

/**
 * The heading's options
 */
const props = defineProps<HeadingProps>()
</script>

<template>
  <div>
    <h2 class="text-2xl">{{ props.title }}</h2>
    <p v-if="props.description" class="mt-1.5 text-sm text-secondary">
      {{ props.description }}
    </p>
  </div>
</template>
