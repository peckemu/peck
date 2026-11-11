<script lang="ts" setup generic="Values extends Record<string, unknown>">
import { type FormOptions, useForm } from 'vee-validate'
import { type z } from 'zod'

/**
 * The form's options
 */
type FormProps = {
  /**
   * The rules the values must meet
   */
  readonly validationSchema?: z.ZodType<Values>

  /**
   * The values it starts with
   */
  readonly initialValues?: FormOptions<Values>['initialValues']
}

/**
 * The form's options
 */
const props = defineProps<FormProps>()

/**
 * The form's events
 */
const emit = defineEmits<{
  /**
   * The values passed the rules
   */
  (event: 'submit', values: Values): void
}>()

/**
 * The form's state
 */
const { handleSubmit, isSubmitting, submitCount } = useForm<Values, Values>({
  initialValues: props.initialValues,
  validationSchema: props.validationSchema,
  validateOnMount: false,
})

/**
 * Submits the form
 */
const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <form v-bind="$attrs" @submit.prevent="onSubmit">
    <slot v-bind="{ isSubmitting, submitCount }" />
  </form>
</template>
