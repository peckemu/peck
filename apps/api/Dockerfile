FROM oven/bun:1.4.3-alpine

WORKDIR /peck

COPY . .
RUN bun install --frozen-lockfile --production --ignore-scripts --filter @peck/api

ENV NODE_ENV=production
WORKDIR /peck/apps/api
USER bun

EXPOSE 3000

CMD ["bun", "src/index.ts"]
