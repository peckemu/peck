import { createHash } from 'node:crypto'

import { ContentError } from '#content/error'
import { Pack } from '#content/pack'

/**
 * The content network's addresses
 */
export type ContentSource = {
  /**
   * The flashvars URL
   */
  readonly flashvars: string

  /**
   * The content URL
   */
  readonly root: string

  /**
   * The hash prefix
   */
  readonly prefix: string
}

/**
 * The content network
 * @class
 */
export class ContentNetwork {
  /**
   * The content URL
   */
  public readonly root: string

  /**
   * The deploy version
   */
  public readonly deploy: string

  /**
   * The build version
   */
  private readonly build: string

  /**
   * The hash prefix
   */
  private readonly prefix: string

  /**
   * Creates the network
   * @param root The content URL
   * @param deploy The deploy version
   * @param build The build version
   * @param prefix The hash prefix
   */
  public constructor(
    root: string,
    deploy: string,
    build: string,
    prefix: string,
  ) {
    this.root = root
    this.deploy = deploy
    this.build = build
    this.prefix = prefix
  }

  /**
   * Gets the live deploy
   * @param source The addresses
   * @returns The network
   */
  public static async current(source: ContentSource): Promise<ContentNetwork> {
    const response = await fetch(source.flashvars)
    if (!response.ok) {
      throw new ContentError(`Flashvars answered ${String(response.status)}`)
    }
    const flashvars = (await response.json()) as Record<string, unknown>
    const deploy = flashvars['deploy_version']
    if (typeof deploy !== 'string' && typeof deploy !== 'number') {
      throw new ContentError('Flashvars have no deploy version')
    }
    const build = flashvars['build_version']
    return new ContentNetwork(
      source.root.endsWith('/') ? source.root : `${source.root}/`,
      String(deploy),
      typeof build === 'string' || typeof build === 'number'
        ? String(build)
        : '0',
      source.prefix,
    )
  }

  /**
   * Fetches a def pack
   * @param id The pack id
   * @returns The pack
   */
  public async pack(id: number): Promise<Pack> {
    const response = await fetch(this.url(`defPacks/${String(id)}`))
    if (!response.ok) {
      throw new ContentError(
        `Pack ${String(id)} answered ${String(response.status)}`,
      )
    }
    return Pack.read(await response.bytes())
  }

  /**
   * Builds a file URL
   * @param path The file path
   * @returns The URL
   */
  public url(path: string): string {
    const parts = path.split('/')
    const name = this.hash(parts.pop() ?? '')
    return `${this.root}${this.deploy}/${[...parts, name].join('/')}?v=${this.build}`
  }

  /**
   * Hashes a file name
   * @param name The file name
   * @returns The hashed name
   */
  private hash(name: string): string {
    const prefixed = this.prefix + name
    let front = ''
    let back = ''
    for (let index = 0; index < prefixed.length; index++) {
      if (index % 2 === 0) back += prefixed.charAt(index)
      else front = prefixed.charAt(index) + front
    }
    return createHash('md5')
      .update(front + back, 'utf8')
      .digest('hex')
  }
}
