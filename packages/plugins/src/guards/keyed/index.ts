import { type PacketContext } from '#plugins/context'
import { Guard } from '#plugins/guards/guard'

/**
 * Only allows keyed sessions
 * @class
 */
export class KeyedGuard extends Guard {
  /**
   * Checks for a login key
   * @param context The packet context
   * @returns The reason, or null
   */
  public check(context: PacketContext): string | null {
    return context.session.randomKey === null ? 'no login key' : null
  }
}

/**
 * Requires a login key
 * @returns The class decorator
 */
export const Keyed =
  () =>
  (target: object, _context: ClassDecoratorContext): void => {
    Guard.attach(target, new KeyedGuard())
  }
