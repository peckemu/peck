import { type PacketContext, type PacketSession } from '#plugins/context'
import { Guard } from '#plugins/guards/guard'

/**
 * Throttle options
 */
export type ThrottleOptions = {
  /**
   * The limit
   */
  readonly limit: number

  /**
   * The window in milliseconds
   */
  readonly per: number
}

/**
 * Throttles a packet
 * @class
 */
export class ThrottleGuard extends Guard {
  /**
   * The throttle options
   */
  private readonly options: ThrottleOptions

  /**
   * The send times by session
   */
  private readonly sent = new WeakMap<PacketSession, number[]>()

  /**
   * Creates the guard
   * @param options The throttle options
   */
  public constructor(options: ThrottleOptions) {
    super()
    this.options = options
  }

  /**
   * Checks the packet rate
   * @param context The packet context
   * @returns The reason, or null
   */
  public check(context: PacketContext): string | null {
    const now = Date.now()
    const times = (this.sent.get(context.session) ?? []).filter(
      (time) => now - time < this.options.per,
    )
    if (times.length >= this.options.limit) return 'sent too often'
    times.push(now)
    this.sent.set(context.session, times)
    return null
  }
}

/**
 * Throttles a packet
 * @param options The throttle options
 * @returns The class decorator
 */
export const Throttle =
  (options: ThrottleOptions) =>
  (target: object, _context: ClassDecoratorContext): void => {
    Guard.attach(target, new ThrottleGuard(options))
  }
