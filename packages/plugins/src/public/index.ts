/**
 * The public handlers
 */
const open = new WeakSet<object>()

/**
 * Allows a handler before login
 * @returns The class decorator
 */
export const Public =
  () =>
  (target: object, _context: ClassDecoratorContext): void => {
    open.add(target)
  }

/**
 * Checks a handler is public
 * @param target The handler class
 * @returns Whether it does
 */
export const isPublic = (target: object): boolean => open.has(target)
