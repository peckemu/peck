<script lang="ts" setup>
/**
 * The empty state's options
 */
type EmptyProps = {
  /**
   * What it says
   */
  readonly message: string
}

/**
 * The empty state's options
 */
const props = defineProps<EmptyProps>()
</script>

<template>
  <p class="px-5 py-10 text-center text-sm text-muted">{{ props.message }}</p>
</template>
