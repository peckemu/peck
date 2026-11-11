import { inject } from '@needle-di/core'
import { type UserVariable } from '@peck/game'
import { UserVariableSetIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { BIT_FIELD_USER_VARS, SERVER_USER_VARS, UserVar } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { DailySpins } from '#emulator/sessions/spins'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * The highest bit a bit field holds
 */
const HIGHEST_BIT = 52

/**
 * Sets one of the player's user variables
 * @class
 */
@Handler(UserVariableSetIncoming)
export class UserVariableSetHandler extends PacketHandler<UserVariableSetIncoming> {
  /**
   * Keeps the player's variables
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Spins the daily wheel
   */
  private readonly spins = inject<DailySpins>(DailySpins)

  /**
   * Sets a variable
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: UserVariableSetIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    if (packet.varId === UserVar.DailyGemBonus) {
      return this.spins.spin(session)
    }

    const refusal = this.refusal(packet.varId)
    if (refusal !== null) {
      context.log.info(
        { varId: packet.varId, refusal },
        'user variable refused',
      )
      return
    }

    const changed = this.changed(player.variables.get(packet.varId), packet)

    await this.variables.change(session, changed)
  }

  /**
   * Finds why a variable can't be set
   * @param varId The variable's id
   * @returns The reason, or null
   */
  private refusal(varId: number): string | null {
    if (varId <= 0) return 'not a variable'
    if (SERVER_USER_VARS.has(varId)) return 'only the server sets it'

    return null
  }

  /**
   * Works out the new variable
   * @param kept The current variable
   * @param packet The packet
   * @returns The variable
   */
  private changed(
    kept: UserVariable | undefined,
    packet: UserVariableSetIncoming,
  ): UserVariable {
    const bitField = BIT_FIELD_USER_VARS.get(packet.varId)

    if (bitField === undefined) {
      return { varId: packet.varId, type: kept?.type ?? 0, value: packet.value }
    }

    const value = UserVariableSetHandler.withBit(
      kept?.value ?? 0,
      packet.value,
      packet.on === 1,
    )

    return { varId: packet.varId, type: bitField, value }
  }

  /**
   * Sets or clears a bit
   * @param field The bit field
   * @param bit The bit's number
   * @param on Whether to set it
   * @returns The new bit field
   */
  private static withBit(field: number, bit: number, on: boolean): number {
    if (!Number.isInteger(bit) || bit < 0 || bit > HIGHEST_BIT) return field

    const bits = Number.isSafeInteger(field) && field >= 0 ? BigInt(field) : 0n
    const mask = 1n << BigInt(bit)

    return Number(on ? bits | mask : bits & ~mask)
  }
}
