import { Entity, Field, type filledKey, Id, type idKey } from 'uql-orm'

/**
 * A room
 * @class
 */
@Entity({ name: 'rooms' })
export class RoomDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'capacity' | 'platformer' | 'nameId'

  /**
   * The room's id in the rooms pack
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * The room's name
   */
  @Field({ type: 'text', nullable: false, unique: true })
  public name!: string

  /**
   * Land 0, ocean 1 or both 2
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public enviroType!: number

  /**
   * Whether the room is a platformer
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public platformer!: boolean

  /**
   * How many players one instance holds
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 30,
  })
  public capacity!: number

  /**
   * The room's name in English
   */
  @Field({ type: 'text', nullable: false })
  public displayName!: string

  /**
   * The room's name string id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public nameId!: number

  /**
   * The join name
   */
  @Field({ type: 'text' })
  public sentName?: string | null
}
