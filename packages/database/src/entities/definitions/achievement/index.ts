import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * An achievement
 * @class
 */
@Entity<AchievementDefinition>({
  name: 'achievement_definitions',
  indexes: [
    {
      name: 'achievement_definitions_user_var',
      columns: (achievement) => [achievement.userVarRef],
    },
  ],
})
export class AchievementDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The achievement's id in the achievement pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The achievement's name
   */
  @Field({ type: 'text', nullable: true })
  public name?: string | null

  /**
   * Its name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrRef!: number

  /**
   * Its Journey Book page
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public type!: number

  /**
   * The user variable it counts
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public userVarRef!: number

  /**
   * The count it needs
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public triggerAmount!: number
}
