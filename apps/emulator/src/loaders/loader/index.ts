/**
 * Loads something at startup
 * @class
 */
export abstract class Loader {
  /**
   * Loads it
   */
  public abstract load(): Promise<void>
}
