import type { Room, Server } from '~/types/api'

/**
 * How many busy rooms to show
 */
const BUSIEST = 6

/**
 * A room across every server
 */
export type BusyRoom = {
  /**
   * The name players see
   */
  readonly name: string

  /**
   * How many are in it
   */
  readonly players: number
}

/**
 * What is happening in the game
 */
export const useWorldStore = defineStore('world', () => {
  const api = useApi()

  /**
   * The game servers
   */
  const servers = ref<Server[]>([])

  /**
   * The busiest rooms
   */
  const rooms = ref<BusyRoom[]>([])

  /**
   * Whether it has loaded once
   */
  const loaded = ref<boolean>(false)

  /**
   * How many are playing
   */
  const online = computed(() =>
    servers.value.reduce((total, server) => total + server.players, 0),
  )

  /**
   * Whether any server is up
   */
  const live = computed(() =>
    servers.value.some((server) => server.status !== 'draining'),
  )

  /**
   * Loads the servers
   * @returns The servers
   */
  const loadServers = async (): Promise<Server[]> => {
    const response = await api.servers.$get()
    if (!response.ok) return []

    const { data } = await response.json()

    return data
  }

  /**
   * Loads the rooms on one server
   * @param id The server id
   * @returns The rooms
   */
  const loadRooms = async (id: number): Promise<Room[]> => {
    const response = await api.servers[':id'].rooms.$get({
      /**
       * The route's parameters
       */
      param: { id: String(id) },
    })
    if (!response.ok) return []

    const { data } = await response.json()

    return data
  }

  /**
   * Adds rooms up across servers
   * @param lists Each server's rooms
   * @returns The busiest rooms
   */
  const busiest = (lists: readonly Room[][]): BusyRoom[] => {
    const totals = new Map<string, number>()

    for (const room of lists.flat()) {
      totals.set(
        room.displayName,
        (totals.get(room.displayName) ?? 0) + room.players,
      )
    }

    return [...totals]
      .map(([name, players]) => ({ name, players }))
      .sort((a, b) => b.players - a.players)
      .slice(0, BUSIEST)
  }

  /**
   * Loads everything
   */
  const load = async (): Promise<void> => {
    const found = await loadServers().catch(() => [])

    const lists = await Promise.all(
      found.map((server) => loadRooms(server.id).catch(() => [])),
    )

    servers.value = found
    rooms.value = busiest(lists)
    loaded.value = true
  }

  return { servers, rooms, loaded, online, live, load }
})
