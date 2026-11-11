import { inject } from '@needle-di/core'
import { type Moved, TradeRepository } from '@peck/database'
import {
  type Deal,
  Item,
  Pet,
  type Player,
  type TradeRefusal,
  TradeRules,
  Trades,
} from '@peck/game'
import {
  type GivenItem,
  ItemListOutgoing,
  type ReceivedItem,
  TradeActionIncoming,
  TradeOutgoing,
  TradeStatus,
} from '@peck/packets'
import { Handler, PacketHandler, PluginEvents, Throttle } from '@peck/plugins'
import { TradeKind } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { TradeLists } from '#emulator/handlers/trade/lists'
import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * The actions
 */
const ACTION = { offer: 0, answer: 1, cancel: 2, confirm: 3 } as const

/**
 * The status for each refusal
 */
const STATUS: Readonly<
  Record<
    TradeRefusal['reason'] | 'blocked' | 'not-listed' | 'offer' | 'item',
    TradeStatus
  >
> = {
  busy: TradeStatus.Busy,
  blocked: TradeStatus.Busy,
  elsewhere: TradeStatus.Elsewhere,
  gone: TradeStatus.Gone,
  'not-listed': TradeStatus.Gone,
  offer: TradeStatus.Gone,
  item: TradeStatus.Gone,
  'pet-in-use': TradeStatus.PetInUse,
  full: TradeStatus.Full,
}

/**
 * The finished trade types
 */
const GIVEN_TYPE: Readonly<Record<number, number>> = {
  [TradeKind.Clothing]: 0,
  [TradeKind.DenItem]: 1,
  [TradeKind.Pet]: 2,
}

/**
 * Handles trades
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(TradeActionIncoming)
export class TradeActionHandler extends PacketHandler<TradeActionIncoming> {
  /**
   * The trades in progress
   */
  private readonly trades = inject<Trades>(Trades)

  /**
   * What can be traded
   */
  private readonly rules = inject<TradeRules>(TradeRules)

  /**
   * Trade lists and trades
   */
  private readonly repository = inject<TradeRepository>(TradeRepository)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Sends trade lists
   */
  private readonly lists = inject<TradeLists>(TradeLists)

  /**
   * Creates the handler
   */
  public constructor() {
    super()

    inject<PluginEvents>(PluginEvents).on('logout', (session) => {
      const gameId = session.player?.gameId
      if (gameId === undefined) return

      this.trades.setBusy(gameId, false)
      return this.backOut(gameId)
    })
  }

  /**
   * Handles a trade action
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: TradeActionIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const [first = ''] = packet.body

    switch (packet.action) {
      case ACTION.offer:
        return this.offer(session, player, packet.body)
      case ACTION.answer:
        return this.answer(player, Number(first))
      case ACTION.cancel:
        return this.backOut(player.gameId)
      case ACTION.confirm:
        return Number(first) === 1
          ? this.confirm(player.gameId)
          : this.backOut(player.gameId)
    }
  }

  /**
   * Offers a trade to a player here
   * @param session The player's session
   * @param requester The player asking
   * @param body The fields
   */
  private async offer(
    session: Session,
    requester: Player,
    body: readonly string[],
  ): Promise<void> {
    const [userName = '', type = '', invIdx = ''] = body
    const owner = this.sessions.byUsername(userName)?.player

    if (
      !owner ||
      owner.gameId === requester.gameId ||
      this.trades.of(requester.gameId)
    ) {
      return session.send<TradeOutgoing>(
        TradeOutgoing.refused(TradeStatus.Busy, owner?.username ?? userName),
      )
    }
    if (this.trades.engaged(owner.gameId)) {
      return session.send<TradeOutgoing>(
        TradeOutgoing.refused(TradeStatus.Busy, owner.username),
      )
    }

    const wanted = TradeRules.wanted(Number(type), Number(invIdx))
    const offered = TradeRules.readOffer(body.slice(3))
    const refusal = this.rules.refusal(requester, owner, wanted, offered)

    if (refusal?.reason === 'elsewhere') {
      return session.send<TradeOutgoing>(
        TradeOutgoing.elsewhere(owner.room?.name ?? ''),
      )
    }
    if (refusal || !offered) {
      const about = refusal?.side === 'requester' ? requester : owner
      return session.send<TradeOutgoing>(
        TradeOutgoing.refused(
          STATUS[refusal?.reason ?? 'gone'],
          about.username,
        ),
      )
    }

    this.trades.open(requester.gameId, owner.gameId, wanted, offered)

    await this.send(
      owner.gameId,
      TradeOutgoing.offer({
        userName: requester.username,
        wantedKind: this.rules.wantedKind(owner, wanted),
        wantedInvIdx: wanted.invIdx,
        ...TradeRules.contents(requester, offered),
      }),
    )
  }

  /**
   * Answers a trade offered
   * @param owner The player asked
   * @param response The answer
   */
  private async answer(owner: Player, response: number): Promise<void> {
    const deal = this.trades.of(owner.gameId)
    if (deal?.owner !== owner.gameId || deal.stage !== 'offered') return

    if (response !== 1) {
      this.trades.close(deal)
      const status = response === 2 ? TradeStatus.Busy : TradeStatus.Denied
      return this.send(
        deal.requester,
        TradeOutgoing.refused(status, owner.username),
      )
    }

    deal.stage = 'accepted'
    await this.send(deal.requester, TradeOutgoing.accepted())
    await this.send(deal.owner, TradeOutgoing.accepted())
  }

  /**
   * Backs out of a trade
   * @param gameId The player backing out
   */
  private async backOut(gameId: number): Promise<void> {
    const deal = this.trades.of(gameId)
    if (!deal || deal.stage === 'making') return

    this.trades.close(deal)

    const other = deal.requester === gameId ? deal.owner : deal.requester
    if (other === deal.owner && deal.stage === 'offered') {
      return this.send(other, TradeOutgoing.closed())
    }

    const name = this.sessions.byPlayer(gameId)?.player?.username ?? ''
    await this.send(other, TradeOutgoing.refused(TradeStatus.Denied, name))
  }

  /**
   * Confirms a trade
   * @param gameId The player confirming
   */
  private async confirm(gameId: number): Promise<void> {
    const deal = this.trades.of(gameId)
    if (deal?.stage !== 'accepted') return

    deal.confirmed.add(gameId)
    if (deal.confirmed.size < 2) return

    deal.stage = 'making'
    await this.make(deal)
  }

  /**
   * Makes a trade both players confirmed
   * @param deal The trade
   */
  private async make(deal: Deal): Promise<void> {
    this.trades.close(deal)

    const requesterSession = this.sessions.byPlayer(deal.requester)
    const ownerSession = this.sessions.byPlayer(deal.owner)
    const requester = requesterSession?.player
    const owner = ownerSession?.player
    if (!requesterSession || !ownerSession || !requester || !owner) return

    const outcome = await this.repository.trade({
      requester: requester.gameId,
      owner: owner.gameId,
      wanted: deal.wanted,
      offered: deal.offered,
      requesterLimits: {
        clothing: requester.clothingLimit,
        denItems: requester.denItemLimit,
        pets: requester.petLimit,
      },
      ownerLimits: {
        clothing: owner.clothingLimit,
        denItems: owner.denItemLimit,
        pets: owner.petLimit,
      },
    })

    if (!outcome.ok) {
      const status = STATUS[outcome.refusal]
      const about =
        outcome.side === 'requester'
          ? requester
          : outcome.side === 'owner'
            ? owner
            : null

      await requesterSession.send<TradeOutgoing>(
        TradeOutgoing.refused(status, (about ?? owner).username),
      )
      await ownerSession.send<TradeOutgoing>(
        TradeOutgoing.refused(status, (about ?? requester).username),
      )
      return
    }

    await this.hand(requesterSession, owner, outcome.toOwner)
    await this.hand(ownerSession, requester, outcome.toRequester)

    await this.done(requesterSession, outcome.toRequester, outcome.toOwner)
    await this.done(ownerSession, outcome.toOwner, outcome.toRequester)
  }

  /**
   * Moves what changed hands in memory
   * @param giverSession The giver's session
   * @param taker The receiver
   * @param moved What moved
   */
  private async hand(
    giverSession: Session,
    taker: Player,
    moved: readonly Moved[],
  ): Promise<void> {
    const giver = giverSession.player
    if (!giver) return

    let undressed = false

    for (const each of moved) {
      giver.tradeList = giver.tradeList.filter(
        (ref) =>
          !TradeRules.same(ref, { kind: each.kind, invIdx: each.fromInvIdx }),
      )

      if (each.kind === TradeKind.Clothing) {
        const item = giver.items.get(each.fromInvIdx)
        if (item && giver.avatar?.wears(item)) undressed = true
        if (item) giver.items.remove(each.fromInvIdx)

        taker.items.add(
          new Item({
            invId: each.invIdx,
            defId: each.defId,
            color: each.color,
          }),
        )
        continue
      }

      if (each.kind === TradeKind.DenItem) {
        const kept = giver.denItems.filter(
          ({ invIdx }) => invIdx !== each.fromInvIdx,
        )
        giver.denItems.splice(0, giver.denItems.length, ...kept)

        taker.denItems.push({
          invIdx: each.invIdx,
          defId: each.defId,
          categoryId: 0,
          version: each.version,
          x: 0,
          y: 0,
          flipped: false,
          userNameLink: '',
          denStoreInvIdx: 0,
        })
        continue
      }

      if (giver.pets.get(each.fromInvIdx)) giver.pets.remove(each.fromInvIdx)
      for (const avatar of giver.avatars) {
        if (avatar.landPetInvIdx === each.fromInvIdx) avatar.landPetInvIdx = 0
        if (avatar.oceanPetInvIdx === each.fromInvIdx) avatar.oceanPetInvIdx = 0
      }
      if (each.pet) taker.pets.add(new Pet(each.pet))
    }

    if (!undressed || !giver.shown || !giver.avatar) return

    const { avatar } = giver
    await this.sessions.broadcast<ItemListOutgoing>(
      giver.roomId,
      ItemListOutgoing.worn(giver.roomId, giver, avatar, giver.worn(avatar)),
      giverSession,
    )
  }

  /**
   * Tells a player their trade is done
   * @param session The player's session
   * @param received What they got
   * @param gave What they gave
   */
  private async done(
    session: Session,
    received: readonly Moved[],
    gave: readonly Moved[],
  ): Promise<void> {
    const { player } = session
    if (!player) return

    const got = received.flatMap((each): ReceivedItem[] => {
      if (each.kind === TradeKind.Clothing) {
        return [
          {
            type: 'clothing',
            item: { defId: each.defId, invId: each.invIdx, color: each.color },
          },
        ]
      }
      if (each.kind === TradeKind.DenItem) {
        return [
          {
            type: 'den-item',
            item: {
              defId: each.defId,
              invIdx: each.invIdx,
              version: each.version,
            },
          },
        ]
      }

      const pet = player.pets.get(each.invIdx)
      return pet ? [{ type: 'pet', pet }] : []
    })
    const given: GivenItem[] = gave.map((each) => ({
      type: GIVEN_TYPE[each.kind] ?? 1,
      invIdx: each.fromInvIdx,
    }))

    await session.send<TradeOutgoing>(TradeOutgoing.done(got, given))
    await this.lists.sendOwn(session)
  }

  /**
   * Sends a local trade packet
   * @param gameId The player
   * @param packet The packet
   */
  private async send(gameId: number, packet: TradeOutgoing): Promise<void> {
    await this.sessions.byPlayer(gameId)?.send<TradeOutgoing>(packet)
  }
}
