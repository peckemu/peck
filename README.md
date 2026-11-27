<p align="center">
  <img src=".github/banner.png" alt="Peck" width="670">
</p>

<p align="center">Peck is an open source Animal Jam Classic emulator, built with <a href="https://bun.sh">Bun</a> and <a href="https://netifyjs.dev">Netify</a>.</p>

## Contents

- [Features](#features)
- [Running it](#running-it)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

## Features

- [x] login and first animal
- [x] animals, colours and name bars
- [x] rooms and chat
- [x] clothes
- [x] dens and den layouts
- [x] den shops
- [x] shops and recycling
- [x] currency exchange, gem donations and diamond bundles
- [x] buddies and blocking
- [x] pets
- [x] trading
- [x] parties
- [x] minigames, pvp and multiplayer
- [x] jam-a-grams
- [x] masterpieces
- [x] jammer wall
- [x] ajhq cards
- [x] achievements
- [x] daily spin
- [x] adventures
- [x] referrals
- [x] gift codes
- [x] world item gifts
- [x] eco gifts
- [x] reports, bans, mutes and kicks
- [x] staff broadcasts and ending parties early
- [x] clustering
- [x] plugins

## Running it

You'll need Bun, PostgreSQL and Redis. Fill in `.env.local` from `.env.example`, then:

```sh
bun install
bun run db:migrate
bun peck content:import
bun run db:seed
bun run dev
```

There are Dockerfiles for the emulator and the API. Build them from the repo root:

```sh
docker build -f apps/emulator/Dockerfile -t peck-emulator .
docker build -f apps/api/Dockerfile -t peck-api .
```

The images don't run migrations, so run `bun run db:migrate` before you start them.

## Limitations

- No chat filter. Phantom had one, but I'm not releasing that part. It's easy enough to write your own if real people are going to use your server.
- I built masterpieces to use an S3 bucket, so you'll have to set one up yourself.
- This was built for client build `1829`.
- Adventures work, but their scripts were on the server and aren't in the client. Each one goes in the `quest_definitions` table by hand, and there's no script engine, so sounds, effects and multi-room adventures don't happen.
- None of Phantom's custom features are in here. That's for you to build yourself.

## Contributing

PRs are welcome, just:

- test what you change, with tests or by trying it in game
- stick to the code style
- no game files or assets

## Disclaimer

Peck isn't affiliated with or endorsed by WildWorks. Animal Jam is their trademark.

Everything here is my own code. There are no game files, assets or client patches in this repo, and I don't run a server.

If something here is yours and you've got a problem with it, open an issue and I'll sort it.

## License

Copyright (C) 2026 Sxip

Peck is free software under the [GNU Affero General Public License v3.0](LICENSE) or any later version. If you run a modified version as a server, you must make its source available to its players.
