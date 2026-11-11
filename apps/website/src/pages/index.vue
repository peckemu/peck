<script lang="ts" setup>
import { Button, Stat, StatGroup } from '@peck/ui'
import { ArrowRight } from 'lucide-vue-next'

import RoomList from '~/components/rooms/index.vue'
import ServerList from '~/components/servers/index.vue'
import SiteFooter from '~/components/site/footer/index.vue'
import SiteHeader from '~/components/site/header/index.vue'
import { NuxtLink } from '#components'
import { useAuthenticationStore, useWorldStore } from '~/store'

/**
 * How often the board refreshes
 */
const REFRESH = 30_000

/**
 * The site settings
 */
const config = useRuntimeConfig()

/**
 * The authentication store
 */
const authentication = useAuthenticationStore()

/**
 * The world store
 */
const world = useWorldStore()

/**
 * The server's name
 */
const name = config.public.SITE_NAME

/**
 * Whether the player is signed in
 */
const { isAuthenticated } = storeToRefs<typeof authentication>(authentication)

/**
 * What is happening in the game
 */
const { servers, rooms, loaded, online, live } =
  storeToRefs<typeof world>(world)

/**
 * Whether anyone is playing
 */
const playing = computed(() => live.value && online.value > 0)

/**
 * How many servers are up
 */
const up = computed(
  () => servers.value.filter((server) => server.status !== 'draining').length,
)

await useAsyncData('world', async () => {
  await world.load()

  return true
})

useIntervalFn(() => void world.load(), REFRESH)

useSeoMeta({
  /**
   * Page title
   */
  title: name,
  /**
   * Page description
   */
  description: `Play Animal Jam Classic on ${name}`,
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <SiteHeader />

    <main class="mx-auto max-w-6xl px-6">
      <section
        class="grid items-end gap-10 pt-20 pb-14 lg:grid-cols-[1.3fr_1fr]"
      >
        <div>
          <h1 class="text-5xl leading-[1.05] sm:text-6xl">
            <template v-if="playing">
              <span class="tabular-nums">{{ online.toLocaleString() }}</span>
              {{ online === 1 ? 'jammer is' : 'jammers are' }} playing on
              {{ name }}
            </template>
            <template v-else-if="live">Be the first in Jamaa today</template>
            <template v-else>{{ name }} will be back soon</template>
          </h1>

          <div class="mt-8 flex flex-wrap gap-3">
            <Button
              v-if="isAuthenticated"
              :as="NuxtLink"
              to="/play"
              size="lg"
              :icon-right="ArrowRight"
            >
              Play now
            </Button>
            <template v-else>
              <Button
                :as="NuxtLink"
                to="/signup"
                size="lg"
                :icon-right="ArrowRight"
              >
                {{ playing ? 'Join them' : 'Create account' }}
              </Button>
              <Button :as="NuxtLink" to="/login" variant="secondary" size="lg">
                Sign in
              </Button>
            </template>
          </div>
        </div>

        <StatGroup>
          <Stat label="Online" :value="online.toLocaleString()" />
          <Stat label="Servers up" :value="up" :suffix="`/${servers.length}`" />
        </StatGroup>
      </section>

      <section class="grid gap-4 border-t border-border py-14 lg:grid-cols-2">
        <RoomList :rooms="rooms" :loaded="loaded" />
        <ServerList :servers="servers" />
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
