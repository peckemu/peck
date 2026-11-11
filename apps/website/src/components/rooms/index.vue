<script lang="ts" setup>
import { Card, Empty, Meter } from '@peck/ui'

import type { BusyRoom } from '~/store'

/**
 * The room list's options
 */
type RoomListProps = {
  /**
   * The rooms, busiest first
   */
  readonly rooms: readonly BusyRoom[]

  /**
   * Whether the rooms have loaded
   */
  readonly loaded?: boolean
}

/**
 * The room list's options
 */
const props = withDefaults(defineProps<RoomListProps>(), {
  loaded: true,
})

/**
 * The busiest room's player count
 */
const busiest = computed(() => props.rooms[0]?.players ?? 0)
</script>

<template>
  <Card title="Busiest rooms" note="Across every server">
    <Empty
      v-if="props.rooms.length === 0"
      :message="
        props.loaded ? 'Nobody is in a room yet' : 'Looking around Jamaa'
      "
    />
    <ol v-else class="divide-y divide-border">
      <li
        v-for="(room, index) in props.rooms"
        :key="room.name"
        class="flex items-center gap-4 px-5 py-3.5"
      >
        <span class="w-4 text-xs text-muted tabular-nums">{{ index + 1 }}</span>
        <span class="min-w-0 flex-1 truncate text-sm">{{ room.name }}</span>
        <Meter
          :value="room.players"
          :max="busiest"
          class="hidden w-28 sm:block"
        />
        <span class="w-10 text-right text-sm tabular-nums">
          {{ room.players }}
        </span>
      </li>
    </ol>
  </Card>
</template>
