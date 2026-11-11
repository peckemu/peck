<script lang="ts" setup>
import { Palette } from 'lucide-vue-next'
import { useField } from 'vee-validate'
import { type Component, computed, useId } from 'vue'

/**
 * The kinds of field
 */
type FieldType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'checkbox'
  | 'color'
  | 'textarea'
  | 'select'
  | 'date'
  | 'datetime-local'
  | 'time'

/**
 * A choice in a select field
 */
type FieldOption = {
  /**
   * What it shows
   */
  readonly label: string

  /**
   * What it sends
   */
  readonly value: string | number
}

/**
 * The field's options
 */
type FieldProps = {
  /**
   * Its id
   */
  readonly id?: string

  /**
   * The kind of field
   */
  readonly type?: FieldType

  /**
   * Its name in the form
   */
  readonly name: string

  /**
   * The text above it
   */
  readonly label?: string

  /**
   * The icon inside it
   */
  readonly icon?: Component

  /**
   * The hint inside it
   */
  readonly placeholder?: string

  /**
   * Whether it must be filled in
   */
  readonly required?: boolean

  /**
   * Whether it is turned off
   */
  readonly disabled?: boolean

  /**
   * Whether to leave it unstyled
   */
  readonly unstyled?: boolean

  /**
   * More classes for the input
   */
  readonly class?: string

  /**
   * Its value
   */
  readonly modelValue?: string | boolean

  /**
   * The textarea's height in rows
   */
  readonly rows?: number

  /**
   * The most characters it takes
   */
  readonly maxlength?: number

  /**
   * Whether to count the characters
   */
  readonly showCharCount?: boolean

  /**
   * The select's choices
   */
  readonly options?: readonly FieldOption[]
}

/**
 * The field's options
 */
const props = withDefaults(defineProps<FieldProps>(), {
  type: 'text',
  required: false,
  disabled: false,
  unstyled: false,
  rows: 4,
  showCharCount: false,
  options: () => [],
})

/**
 * The field's events
 */
const emit = defineEmits<{
  /**
   * The value changed
   */
  (event: 'update:modelValue', value: string | boolean): void
}>()

/**
 * The field's slots
 */
const slots = defineSlots<{
  /**
   * Something at the input's end
   */
  trailing?: () => unknown
}>()

/**
 * The classes every styled input has
 */
const BASE = [
  'w-full rounded-control border bg-surface text-sm leading-body text-foreground outline-none',
  'transition-colors duration-160 ease-standard placeholder:text-muted',
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-50',
]

/**
 * The classes an input has without an error
 */
const VALID =
  'border-border-strong hover:border-foreground focus-visible:border-foreground'

/**
 * The classes an input has with an error
 */
const INVALID = 'border-danger'

/**
 * The id made for the field
 */
const madeId = useId()

/**
 * The input's id
 */
const inputId = computed(() => props.id || madeId)

/**
 * The error's id
 */
const errorId = computed(() => `${inputId.value}-error`)

/**
 * The field's state in the form
 */
const { errorMessage, value, handleChange, meta } = useField<string | boolean>(
  () => props.name,
  undefined,
  { validateOnValueUpdate: false, validateOnMount: false, syncVModel: true },
)

/**
 * Whether to show the error
 */
const showError = computed(
  () => (meta.touched || meta.dirty) && !!errorMessage.value,
)

/**
 * Whether it is a checkbox
 */
const isCheckbox = computed(() => props.type === 'checkbox')

/**
 * Whether it is a colour picker
 */
const isColor = computed(() => props.type === 'color')

/**
 * Whether it is a textarea
 */
const isTextarea = computed(() => props.type === 'textarea')

/**
 * Whether it is a select
 */
const isSelect = computed(() => props.type === 'select')

/**
 * The text value
 */
const text = computed(() =>
  typeof value.value === 'string' ? value.value : '',
)

/**
 * Handles typing
 * @param event The input event
 */
const onInput = (event: Event): void => {
  handleChange(event, !!errorMessage.value)
}

/**
 * Takes a typed colour code
 * @param event The input event
 */
const onHexInput = (event: Event): void => {
  const typed = (event.target as HTMLInputElement).value

  if (/^#[\dA-Fa-f]{0,6}$/.test(typed)) value.value = typed
}

/**
 * The input's classes
 */
const inputClasses = computed(() => {
  if (props.unstyled) return props.class ?? ''

  const state = showError.value ? INVALID : VALID

  if (isTextarea.value) {
    return [...BASE, 'min-h-[110px] resize-y p-3', state, props.class]
  }
  if (isSelect.value) {
    return [...BASE, 'min-h-11 cursor-pointer px-3', state, props.class]
  }

  return [
    ...BASE,
    'min-h-11',
    props.icon ? 'pr-3 pl-10' : 'px-3',
    slots.trailing ? 'pr-11' : '',
    state,
    props.class,
  ]
})
</script>

<template>
  <input
    v-if="isCheckbox"
    :id="inputId"
    v-model="value"
    :name="props.name"
    type="checkbox"
    :disabled="props.disabled"
    :class="
      props.class ||
      'size-4 rounded-[5px] border-border-strong accent-foreground'
    "
    :aria-invalid="showError"
    :aria-describedby="showError ? errorId : undefined"
    @blur="handleChange"
    @change="handleChange"
  />

  <div v-else class="grid min-w-0">
    <label
      v-if="props.label && !props.unstyled"
      :for="inputId"
      class="mb-2 flex items-baseline justify-between gap-2 text-sm leading-body font-medium text-foreground"
    >
      {{ props.label }}
      <span v-if="!props.required" class="text-xs font-normal text-muted">
        Optional
      </span>
    </label>

    <textarea
      v-if="isTextarea"
      :id="inputId"
      :value="text"
      :name="props.name"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :rows="props.rows"
      :maxlength="props.maxlength"
      :class="inputClasses"
      :aria-invalid="showError"
      :aria-describedby="showError ? errorId : undefined"
      @input="onInput"
      @blur="handleChange"
      @change="handleChange"
    />

    <select
      v-else-if="isSelect"
      :id="inputId"
      :value="value"
      :name="props.name"
      :disabled="props.disabled"
      :class="inputClasses"
      :aria-invalid="showError"
      :aria-describedby="showError ? errorId : undefined"
      @blur="handleChange"
      @change="handleChange"
    >
      <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <div v-else-if="isColor" class="relative">
      <input
        :id="inputId"
        :value="text"
        :name="props.name"
        type="color"
        :disabled="props.disabled"
        class="absolute inset-0 size-full cursor-pointer opacity-0"
        :aria-invalid="showError"
        :aria-describedby="showError ? errorId : undefined"
        @input="onInput"
        @blur="handleChange"
        @change="handleChange"
      />
      <div
        class="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border bg-surface px-3 transition-colors duration-160 ease-standard"
        :class="[
          showError ? INVALID : VALID,
          { 'cursor-not-allowed opacity-50': props.disabled },
        ]"
      >
        <div
          class="size-6 rounded-lg border border-border"
          :style="{ backgroundColor: text || '#000000' }"
        />
        <input
          :value="text"
          type="text"
          :placeholder="props.placeholder || '#000000'"
          :disabled="props.disabled"
          maxlength="7"
          class="w-full flex-1 bg-transparent font-mono text-sm text-foreground uppercase outline-none placeholder:text-muted"
          @input="onHexInput"
        />
        <Palette class="size-4 text-muted" :stroke-width="1.75" />
      </div>
    </div>

    <div v-else class="relative">
      <component
        :is="props.icon"
        v-if="props.icon && !props.unstyled"
        class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
        :class="showError ? 'text-danger' : 'text-muted'"
        :stroke-width="1.75"
      />
      <input
        :id="inputId"
        :value="text"
        :name="props.name"
        :type="props.type"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :class="inputClasses"
        :aria-invalid="showError"
        :aria-describedby="showError ? errorId : undefined"
        @input="onInput"
        @blur="handleChange"
        @change="handleChange"
      />
      <div
        v-if="slots.trailing"
        class="absolute top-1/2 right-1 grid -translate-y-1/2"
      >
        <slot name="trailing" />
      </div>
    </div>

    <p
      v-if="isTextarea && props.showCharCount && props.maxlength"
      class="pt-2 text-xs leading-body text-muted tabular-nums"
    >
      {{ text.length }}/{{ props.maxlength }} characters
    </p>

    <Transition
      enter-active-class="transition duration-240 ease-enter"
      enter-from-class="-translate-y-1 opacity-0 blur-[2px]"
      leave-active-class="transition duration-160 ease-standard"
      leave-to-class="opacity-0"
    >
      <p
        v-if="showError && !props.unstyled"
        :id="errorId"
        role="alert"
        class="pt-2 text-xs leading-body text-danger"
      >
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>
