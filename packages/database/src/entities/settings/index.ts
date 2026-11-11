import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
  OneToOne,
  sql,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A player's chat command settings
 * @class
 */
@Entity<CommandSettings>({
  name: 'command_settings',
  checks: [
    {
      name: 'command_settings_room_themes_check',
      where: (settings) => sql`jsonb_typeof(${settings.roomThemes}) = 'object'`,
    },
    {
      name: 'command_settings_last_purchase_check',
      where: (settings) =>
        sql`${settings.lastPurchase} IS NULL OR jsonb_typeof(${settings.lastPurchase}) = 'object'`,
    },
    {
      name: 'command_settings_den_name_check',
      where: (settings) =>
        sql`${settings.denName} IS NULL OR length(${settings.denName}) BETWEEN 1 AND 24`,
    },
  ],
})
export class CommandSettings {
  /**
   * The key field
   */
  declare public [idKey]?: 'gameId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'roomThemes' | 'randomThemes' | 'hideBlocked' | 'staffLook' | 'updatedAt'

  /**
   * The player the settings belong to
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The room themes
   */
  @Field({ type: 'jsonb', nullable: false, defaultValue: {} })
  public roomThemes!: Json

  /**
   * Whether rooms are given a random theme
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public randomThemes!: boolean

  /**
   * Whether blocked players are hidden
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public hideBlocked!: boolean

  /**
   * The den's name
   */
  @Field({ type: 'text' })
  public denName?: string | null

  /**
   * The last command purchase
   */
  @Field({ type: 'jsonb' })
  public lastPurchase?: Json | null

  /**
   * Whether staff look is shown
   */
  @Field({ type: Boolean, nullable: false, defaultValue: true })
  public staffLook!: boolean

  /**
   * When the settings were last changed
   */
  @Field({
    type: Date,
    nullable: false,
    defaultValue: currentTimestamp,
    onUpdate: () => new Date(),
  })
  public updatedAt!: Date

  /**
   * The player the settings belong to
   */
  @OneToOne({ entity: () => Player, references: (settings) => settings.gameId })
  public player?: Player
}
