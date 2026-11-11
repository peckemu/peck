<script lang="ts" setup>
import { ChevronDown } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * An accordion row
 */
type AccordionItem = {
  /**
   * Its id
   */
  readonly id: string

  /**
   * Its title
   */
  readonly title: string

  /**
   * The line under the title
   */
  readonly subtitle?: string

  /**
   * What it opens to
   */
  readonly content: string
}

/**
 * The accordion's options
 */
type AccordionProps = {
  /**
   * Its rows
   */
  readonly items?: readonly AccordionItem[]

  /**
   * Whether many rows can be open
   */
  readonly allowMultiple?: boolean

  /**
   * The rows open at first
   */
  readonly defaultOpen?: readonly string[]
}

/**
 * The accordion's options
 */
const props = withDefaults(defineProps<AccordionProps>(), {
  items: () => [],
  allowMultiple: false,
  defaultOpen: () => [],
})

/**
 * The open rows
 */
const openIds = ref<string[]>([...props.defaultOpen])

/**
 * Checks a row is open
 * @param id The row id
 * @returns Whether it is
 */
const isOpen = (id: string): boolean => openIds.value.includes(id)

/**
 * Opens or closes a row
 * @param id The row id
 */
const toggle = (id: string): void => {
  if (props.allowMultiple) {
    openIds.value = isOpen(id)
      ? openIds.value.filter((open) => open !== id)
      : [...openIds.value, id]
    return
  }

  openIds.value = isOpen(id) ? [] : [id]
}

/**
 * Waits for a row's height to finish moving
 * @param body The row's body
 * @param done Ends the transition
 */
const settle = (body: HTMLElement, done: () => void): void => {
  const finish = (event: TransitionEvent): void => {
    if (event.target !== body || event.propertyName !== 'height') return

    body.removeEventListener('transitionend', finish)
    done()
  }

  body.addEventListener('transitionend', finish)
}

/**
 * Opens a row
 * @param element The row's body
 * @param done Ends the transition
 */
const onEnter = (element: Element, done: () => void): void => {
  const body = element as HTMLElement

  body.style.height = '0px'
  body.style.opacity = '0'
  void body.offsetHeight
  body.style.height = `${String(body.scrollHeight)}px`
  body.style.opacity = '1'

  settle(body, done)
}

/**
 * Lets an open row size itself
 * @param element The row's body
 */
const onAfterEnter = (element: Element): void => {
  ;(element as HTMLElement).style.height = 'auto'
}

/**
 * Closes a row
 * @param element The row's body
 * @param done Ends the transition
 */
const onLeave = (element: Element, done: () => void): void => {
  const body = element as HTMLElement

  body.style.height = `${String(body.scrollHeight)}px`
  void body.offsetHeight
  body.style.height = '0px'
  body.style.opacity = '0'

  settle(body, done)
}
</script>

<template>
  <div
    class="flex flex-col divide-y divide-border overflow-hidden rounded-surface border border-border bg-surface"
  >
    <div v-for="item in props.items" :key="item.id">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-between p-4 text-left font-medium text-foreground transition-colors hover:bg-surface-raised"
        :aria-expanded="isOpen(item.id)"
        @click="toggle(item.id)"
      >
        <div>
          <div class="text-sm font-medium text-foreground">
            {{ item.title }}
          </div>
          <div v-if="item.subtitle" class="mt-0.5 text-xs text-muted">
            {{ item.subtitle }}
          </div>
        </div>

        <ChevronDown
          class="ml-2 size-4 shrink-0 text-secondary transition-transform duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
          :class="{ 'rotate-180': isOpen(item.id) }"
        />
      </button>

      <Transition
        :css="false"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
      >
        <div
          v-if="isOpen(item.id)"
          class="unfold overflow-hidden transition-[height,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <div
            class="unfold-content px-4 pt-0 pb-4 text-xs leading-relaxed text-secondary sm:text-sm"
          >
            {{ item.content }}
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.unfold-content {
  animation: unfold 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes unfold {
  from {
    opacity: 0;
    translate: 0 -4px;
  }
}
</style>
