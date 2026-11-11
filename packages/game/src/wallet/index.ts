import { type Currency } from '@peck/shared'

import { GameError } from '#game/error'

/**
 * A player's balances
 * @class
 */
export class Wallet {
  /**
   * The non-zero balances
   */
  private readonly balances = new Map<Currency, number>()

  /**
   * Creates a wallet
   * @param balances The starting balances
   */
  public constructor(balances: Partial<Record<Currency, number>> = {}) {
    for (const [currency, amount] of Object.entries(balances) as [
      Currency,
      number,
    ][]) {
      this.credit(currency, amount)
    }
  }

  /**
   * Reads a balance
   * @param currency The currency
   * @returns How much the player has
   */
  public balance(currency: Currency): number {
    return this.balances.get(currency) ?? 0
  }

  /**
   * Whether the player has enough
   * @param currency The currency
   * @param amount The amount needed
   * @returns Whether they can pay it
   */
  public canAfford(currency: Currency, amount: number): boolean {
    return this.balance(currency) >= amount
  }

  /**
   * Adds to a balance
   * @param currency The currency
   * @param amount How much to add
   * @returns The new balance
   */
  public credit(currency: Currency, amount: number): number {
    Wallet.check(amount)
    const balance = this.balance(currency) + amount
    this.balances.set(currency, balance)
    return balance
  }

  /**
   * Takes from a balance
   * @param currency The currency
   * @param amount How much to take
   * @returns The new balance
   */
  public debit(currency: Currency, amount: number): number {
    Wallet.check(amount)
    if (!this.canAfford(currency, amount)) {
      throw new GameError(`Not enough ${currency}`, 'INSUFFICIENT_FUNDS')
    }
    const balance = this.balance(currency) - amount
    this.balances.set(currency, balance)
    return balance
  }

  /**
   * Sets a balance
   * @param currency The currency
   * @param amount The balance
   */
  public set(currency: Currency, amount: number): void {
    Wallet.check(amount)
    this.balances.set(currency, amount)
  }

  /**
   * Sets several balances
   * @param balances The balances
   */
  public update(balances: Partial<Record<Currency, number>>): void {
    for (const [currency, amount] of Object.entries(balances) as [
      Currency,
      number,
    ][]) {
      this.set(currency, amount)
    }
  }

  /**
   * Checks an amount is valid
   * @param amount The amount
   */
  private static check(amount: number): void {
    if (!Number.isSafeInteger(amount) || amount < 0) {
      throw new GameError('Invalid amount', 'INVALID_AMOUNT')
    }
  }
}
