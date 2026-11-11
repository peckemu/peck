/**
 * A token bucket rate limit
 * @class
 */
export class RateLimiter {
  /**
   * How many may pass each second
   */
  private readonly rate: number

  /**
   * How many may pass at once
   */
  private readonly burst: number

  /**
   * How many may pass now
   */
  private tokens: number

  /**
   * When the tokens were last topped up
   */
  private updated: number

  /**
   * Creates a limiter
   * @param rate The rate per second
   * @param burst The burst size
   * @param now The current time in milliseconds
   */
  public constructor(rate: number, burst: number, now = performance.now()) {
    this.rate = rate
    this.burst = burst
    this.tokens = burst
    this.updated = now
  }

  /**
   * Takes one token
   * @param now The current time in milliseconds
   * @returns Whether it was allowed
   */
  public take(now = performance.now()): boolean {
    this.tokens = Math.min(
      this.burst,
      this.tokens + ((now - this.updated) / 1000) * this.rate,
    )
    this.updated = now
    if (this.tokens < 1) return false
    this.tokens -= 1
    return true
  }
}
