<script lang="ts" setup>
import { AuthenticationCard, Button, Field, Status } from '@peck/ui'
import { Eye, EyeOff } from 'lucide-vue-next'

import { NuxtLink } from '#components'
import { useAuthenticationStore } from '~/store'

/**
 * The backdrop's ring sizes
 */
const RINGS: readonly number[] = [140, 220, 300, 380, 460, 540]

/**
 * The site settings
 */
const config = useRuntimeConfig()

/**
 * The authentication store
 */
const store = useAuthenticationStore()

/**
 * The server's name
 */
const name = config.public.SITE_NAME

/**
 * The sign in state
 */
const { loading, error } = storeToRefs<typeof store>(store)

/**
 * The username or email typed
 */
const login = ref<string>('')

/**
 * The password typed
 */
const password = ref<string>('')

/**
 * Whether the password is shown
 */
const showPassword = ref<boolean>(false)

/**
 * Signs in with what was typed
 */
const handleAuthentication = async (): Promise<void> => {
  await store.authenticateWithEmailAndPassword({
    login: login.value,
    password: password.value,
  })
}

useSeoMeta({
  /**
   * Page title
   */
  title: `Sign in to ${name}`,
  /**
   * Page description
   */
  description: `Sign in to your ${name} account`,
})
</script>

<template>
  <div
    class="relative isolate grid min-h-dvh grid-rows-[64px_minmax(0,1fr)_64px] overflow-hidden bg-background text-foreground"
  >
    <div
      class="pointer-events-none absolute inset-0 -z-10 mask-[radial-gradient(ellipse_72%_78%_at_50%_50%,#000_38%,transparent_100%)]"
      aria-hidden="true"
    >
      <svg class="absolute inset-0 size-full overflow-visible">
        <line x1="50%" y1="0" x2="50%" y2="100%" class="stroke-border-subtle" />
        <line x1="0" y1="50%" x2="100%" y2="50%" class="stroke-border-subtle" />
        <circle
          v-for="(ring, index) in RINGS"
          :key="ring"
          cx="50%"
          cy="50%"
          :r="ring"
          fill="none"
          :class="index % 2 === 1 ? 'stroke-border' : 'stroke-border-subtle'"
        />
      </svg>
    </div>

    <div class="flex min-w-0 items-center justify-between gap-4 px-6">
      <NuxtLink
        to="/"
        class="font-display text-lg font-medium tracking-display"
      >
        {{ name }}
      </NuxtLink>

      <p
        class="flex items-center gap-1 text-sm leading-body whitespace-nowrap text-secondary"
      >
        <span class="hidden sm:inline">New here?</span>
        <NuxtLink
          to="/signup"
          class="inline-flex min-h-9 items-center rounded-full px-3 font-medium text-foreground transition-colors duration-160 ease-standard hover:bg-surface-muted"
        >
          Create account
        </NuxtLink>
      </p>
    </div>

    <div class="grid min-w-0 place-items-center px-4 py-6">
      <AuthenticationCard
        title="Welcome back"
        :subtitle="`Sign in to play on ${name}.`"
      >
        <form class="grid gap-4" @submit.prevent="handleAuthentication">
          <Status v-if="error" :message="error" />

          <Field
            v-model="login"
            name="login"
            label="Username or email"
            placeholder="Your username"
            autocomplete="username"
            required
          />

          <Field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            placeholder="Your password"
            autocomplete="current-password"
            required
          >
            <template #trailing>
              <button
                type="button"
                class="grid size-9 place-items-center rounded-xl text-muted transition-colors duration-160 ease-standard hover:bg-surface-muted hover:text-foreground"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff
                  v-if="showPassword"
                  class="size-4"
                  :stroke-width="1.75"
                />
                <Eye v-else class="size-4" :stroke-width="1.75" />
              </button>
            </template>
          </Field>

          <Button
            type="submit"
            size="lg"
            :loading="loading"
            full-width
            class="mt-2"
          >
            Sign in
          </Button>
        </form>
      </AuthenticationCard>
    </div>

    <div
      class="flex min-w-0 items-center justify-between gap-4 px-6 text-xs leading-body text-muted"
    >
      <span>{{ name }}</span>
      <Button :as="NuxtLink" to="/" variant="ghost" size="xs">
        Back to home
      </Button>
    </div>
  </div>
</template>
