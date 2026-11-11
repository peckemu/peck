FROM oven/bun:1.4.3-alpine

WORKDIR /peck

COPY . .
RUN bun install --frozen-lockfile --production --ignore-scripts --filter @peck/emulator

ENV NODE_ENV=production
WORKDIR /peck/apps/emulator
USER bun

EXPOSE 443

CMD ["bun", "src/index.ts"]
