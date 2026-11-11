import { type ClusterStore } from '#cluster/store'

/**
 * The channel cluster events go on
 */
const CHANNEL = 'peck:events'

/**
 * A cluster event
 */
export type ClusterEvent = {
  /**
   * What happened
   */
  readonly type: string
}

/**
 * A player in a cluster event
 */
export type ClusterPlayer = {
  /**
   * Their id in the database
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string

  /**
   * Their uuid
   */
  readonly uuid: string

  /**
   * Their account type
   */
  readonly accountType: number
}

/**
 * Buddy events between nodes
 */
export type BuddyEvent =
  | {
      readonly type: 'buddy-request'
      readonly to: number
      readonly from: string
    }
  | {
      readonly type: 'buddy-added'
      readonly to: number
      readonly buddy: ClusterPlayer
    }
  | {
      readonly type: 'buddy-declined'
      readonly to: number
      readonly username: string
    }
  | {
      readonly type: 'buddy-removed'
      readonly to: number
      readonly username: string
    }
  | {
      readonly type: 'buddy-status'
      readonly buddy: ClusterPlayer
      readonly online: boolean
    }
  | {
      readonly type: 'block'
      readonly to: number
      readonly blockerGameId: number
      readonly on: boolean
    }
  | {
      readonly type: 'player-renamed'
      readonly gameId: number
      readonly from: string
      readonly to: string
    }

/**
 * A masterpiece staff decided
 */
export type MasterpieceEvent = {
  /**
   * What happened
   */
  readonly type: 'masterpiece-decided'

  /**
   * The painter
   */
  readonly gameId: number

  /**
   * The masterpiece
   */
  readonly uniqueImageId: string

  /**
   * Whether it was approved
   */
  readonly approved: boolean

  /**
   * The painter's new diamonds
   */
  readonly diamonds: number

  /**
   * The returned token, or null
   */
  readonly token: { readonly invIdx: number; readonly defId: number } | null
}

/**
 * A gift moving between players
 */
export type ClusterGift = {
  /**
   * Clothing or den item
   */
  readonly type: number

  /**
   * Its inventory index
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * Its colour
   */
  readonly color: number

  /**
   * Which of its looks
   */
  readonly version: number
}

/**
 * Jam-a-Gram news for a player
 */
export type JamagramEvent =
  | {
      /**
       * A card arrived
       */
      readonly type: 'jamagram-sent'

      /**
       * The receiving player
       */
      readonly to: number

      /**
       * The card
       */
      readonly id: number
    }
  | {
      /**
       * A gift came back
       */
      readonly type: 'jamagram-gift'

      /**
       * The receiving player
       */
      readonly to: number

      /**
       * The gift
       */
      readonly gift: ClusterGift
    }

/**
 * Staff acting on a player
 */
export type ModerationEvent =
  | {
      /**
       * An account was banned
       */
      readonly type: 'player-banned'

      /**
       * The account
       */
      readonly accountId: string

      /**
       * When the ban ends, or null
       */
      readonly until: number | null
    }
  | {
      /**
       * An account was muted
       */
      readonly type: 'player-muted'

      /**
       * The account
       */
      readonly accountId: string

      /**
       * When the mute ends, or null
       */
      readonly until: number | null
    }
  | {
      /**
       * An account's mute was lifted
       */
      readonly type: 'player-unmuted'

      /**
       * The account
       */
      readonly accountId: string
    }
  | {
      /**
       * A player was kicked
       */
      readonly type: 'player-kicked'

      /**
       * The player
       */
      readonly gameId: number
    }

/**
 * Events sent between nodes
 * @class
 */
export class ClusterEvents<E extends ClusterEvent> {
  /**
   * The cluster store
   */
  private readonly store: ClusterStore

  /**
   * Creates the events
   * @param store The cluster store
   */
  public constructor(store: ClusterStore) {
    this.store = store
  }

  /**
   * Tells every node
   * @param event The event
   */
  public async publish(event: E): Promise<void> {
    await this.store.publish(CHANNEL, JSON.stringify(event))
  }

  /**
   * Listens for events
   * @param listener The event listener
   */
  public async listen(listener: (event: E) => void): Promise<void> {
    await this.store.subscribe(CHANNEL, (message) => {
      listener(JSON.parse(message) as E)
    })
  }
}
