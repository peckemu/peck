import { type Logger } from '@peck/logger'

import { type PacketSession } from '#plugins/context'

/**
 * The plugin events
 */
export type PluginEventMap = {
  /**
   * Emulator start
   */
  start: []

  /**
   * Emulator stop
   */
  stop: []

  /**
   * Player login
   */
  login: [session: PacketSession]

  /**
   * Player logout
   */
  logout: [session: PacketSession]

  /**
   * Player joins a room
   */
  join: [session: PacketSession, roomId: number]

  /**
   * Player leaves a room
   */
  leave: [session: PacketSession, roomId: number]
}

/**
 * An event's name
 */
export type PluginEvent = keyof PluginEventMap

/**
 * Listens for an event
 */
export type PluginListener<E extends PluginEvent> = (
  ...args: PluginEventMap[E]
) => void | Promise<void>

/**
 * The plugin events
 * @class
 */
export class PluginEvents {
  /**
   * The logger
   */
  private readonly log: Logger | null

  /**
   * The listeners for each event
   */
  private readonly listeners = new Map<
    PluginEvent,
    Set<PluginListener<never>>
  >()

  /**
   * Creates the events
   * @param log The logger
   */
  public constructor(log: Logger | null = null) {
    this.log = log
  }

  /**
   * Listens for an event
   * @param event The event
   * @param listener The listener
   * @returns A function to stop listening
   */
  public on<E extends PluginEvent>(
    event: E,
    listener: PluginListener<E>,
  ): () => void {
    const listeners = this.listeners.get(event) ?? new Set()
    listeners.add(listener)
    this.listeners.set(event, listeners)
    return () => listeners.delete(listener)
  }

  /**
   * Emits an event
   * @param event The event
   * @param args The event arguments
   */
  public async emit<E extends PluginEvent>(
    event: E,
    ...args: PluginEventMap[E]
  ): Promise<void> {
    for (const listener of this.listeners.get(event) ?? []) {
      try {
        await (listener as PluginListener<E>)(...args)
      } catch (error) {
        this.log?.error({ err: error, event }, 'event listener failed')
      }
    }
  }
}
