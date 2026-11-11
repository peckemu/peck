<script lang="ts" setup>
import { Button } from '@peck/ui'

import { NuxtLink } from '#components'
import { useAuthenticationStore } from '~/store'

/**
 * A link in the header
 */
type HeaderLink = {
  /**
   * What it says
   */
  readonly label: string

  /**
   * Where it goes
   */
  readonly href: string
}

/**
 * The header's options
 */
type SiteHeaderProps = {
  /**
   * Its links
   */
  readonly links?: readonly HeaderLink[]
}

/**
 * The header's options
 */
const props = withDefaults(defineProps<SiteHeaderProps>(), {
  links: () => [],
})

/**
 * The site settings
 */
const config = useRuntimeConfig()

/**
 * The authentication store
 */
const authentication = useAuthenticationStore()

/**
 * Whether the player is signed in
 */
const { isAuthenticated } = storeToRefs<typeof authentication>(authentication)
</script>

<template>
  <header class="border-b border-border">
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-8 px-6">
      <NuxtLink to="/" class="text-[15px] font-semibold tracking-display">
        {{ config.public.SITE_NAME }}
      </NuxtLink>

      <nav class="hidden items-center gap-6 text-sm text-secondary sm:flex">
        <a
          v-for="link in props.links"
          :key="link.href"
          :href="link.href"
          class="transition-colors hover:text-foreground"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <Button v-if="isAuthenticated" :as="NuxtLink" to="/play" size="sm">
          Play
        </Button>
        <template v-else>
          <Button :as="NuxtLink" to="/login" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button :as="NuxtLink" to="/signup" size="sm">Create account</Button>
        </template>
      </div>
    </div>
  </header>
</template>
