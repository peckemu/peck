import { type PacketContext } from '../../context/index.ts'
import { Guard } from '../guard/index.ts'

/**
 * Only allows guests
 * @class
 */
export class GuestGuard extends Guard {
  /**
   * Checks the player is a guest
   * @param context The packet context
   * @returns The reason, or null
   */
  public check(context: PacketContext): string | null {
    return context.session.authenticated ? 'already logged in' : null
  }
}

/**
 * Only allows guests
 * @returns The class decorator
 */
export const Guest =
  () =>
  (target: object, _context: ClassDecoratorContext): void => {
    Guard.attach(target, new GuestGuard())
  }
