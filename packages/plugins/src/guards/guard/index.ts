import { type PacketContext } from '#plugins/context'

/**
 * A packet guard
 * @class
 */
export abstract class Guard {
  /**
   * The guards by handler
   */
  private static readonly attached = new WeakMap<object, Guard[]>()

  /**
   * Adds a guard to a handler class
   * @param target The handler class
   * @param guard The guard
   */
  public static attach(target: object, guard: Guard): void {
    const guards = Guard.attached.get(target) ?? []
    guards.push(guard)
    Guard.attached.set(target, guards)
  }

  /**
   * Lists a handler class's guards
   * @param target The handler class
   * @returns The guards
   */
  public static of(target: object): readonly Guard[] {
    return Guard.attached.get(target) ?? []
  }

  /**
   * Checks a packet
   * @param context The packet context
   * @returns The reason, or null
   */
  public abstract check(context: PacketContext): string | null
}
