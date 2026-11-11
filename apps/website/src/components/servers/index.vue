<script lang="ts" setup>
import { Card, Empty, Indicator, Meter } from '@peck/ui'

import type { Server } from '~/types/api'

/**
 * The server list's options
 */
type ServerListProps = {
  /**
   * The servers
   */
  readonly servers: readonly Server[]
}

/**
 * The server list's options
 */
const props = defineProps<ServerListProps>()

/**
 * The words for each status
 */
const STATUS: Readonly<Record<Server['status'], string>> = {
  open: 'Online',
  full: 'Full',
  draining: 'Restarting',
}

/**
 * The indicator for each status
 */
const TONES = {
  open: 'success',
  full: 'warning',
  draining: 'muted',
} as const satisfies Record<Server['status'], string>
</script>

<template>
  <Card title="Servers" note="Updates every 30 seconds">
    <Empty
      v-if="props.servers.length === 0"
      message="No servers are running right now"
    />
    <ul v-else class="divide-y divide-border">
      <li
        v-for="server in props.servers"
        :key="server.id"
        class="flex items-center gap-4 px-5 py-3.5"
      >
        <Indicator :tone="TONES[server.status]" />
        <span class="grid min-w-0 flex-1">
          <span class="truncate text-sm">{{ server.name }}</span>
          <span class="text-xs text-muted">{{ STATUS[server.status] }}</span>
        </span>
        <Meter
          :value="server.players"
          :max="server.capacity"
          class="hidden w-28 sm:block"
        />
        <span class="w-20 text-right text-sm text-secondary tabular-nums">
          {{ server.players }}/{{ server.capacity }}
        </span>
      </li>
    </ul>
  </Card>
</template>
