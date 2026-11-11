import { type NodeInfo } from '@peck/cluster'

import { type Config } from '#api/config'
import { ServiceError } from '#api/errors'

/**
 * The game's flashvars
 */
export type Flashvars = {
  /**
   * Where the game's content is
   */
  readonly content: string

  /**
   * The content's deploy
   */
  readonly deploy_version: string

  /**
   * The content's build
   */
  readonly build_version: string

  /**
   * The game server's host
   */
  readonly smartfoxServer: string

  /**
   * The game server's port
   */
  readonly smartfoxPort: string

  /**
   * The fallback server's host
   */
  readonly blueboxServer: string

  /**
   * The fallback server's port
   */
  readonly blueboxPort: string

  /**
   * Whether the game server uses TLS
   */
  readonly smartfoxTls: string

  /**
   * The website
   */
  readonly website: string

  /**
   * Where the art studio uploads to
   */
  readonly mdUrl: string

  /**
   * Where the Jammer Wall's service is
   */
  readonly playerWallHost: string

  /**
   * The time now, in seconds
   */
  readonly currentTimestamp: string
}

/**
 * Builds the flashvars for a node
 * @param game The game config
 * @param node The node the game connects to
 * @param api The API's address
 * @returns The flashvars
 */
export const flashvars = (
  game: Config['game'],
  node: NodeInfo,
  api: string,
): Flashvars => {
  const { content, deployVersion, buildVersion, website } = game

  if (!content || !deployVersion || !buildVersion) {
    throw new ServiceError('The game content is not set up', 'UNAVAILABLE')
  }

  return {
    content,
    deploy_version: deployVersion,
    build_version: buildVersion,
    smartfoxServer: node.host,
    smartfoxPort: String(node.port),
    blueboxServer: node.host,
    blueboxPort: String(node.port),
    smartfoxTls: '0',
    website,
    mdUrl: `${api.replace(/\/$/, '')}/`,
    playerWallHost: `${api.replace(/\/$/, '')}/wall`,
    currentTimestamp: String(Math.floor(Date.now() / 1000)),
  }
}
