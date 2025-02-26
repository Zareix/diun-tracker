FROM oven/bun:1.2.4 as builder

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build


FROM oven/bun:1.2.4-slim

WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=builder /app/drizzle ./drizzle
COPY package.json bun.lockb ./

RUN bun install 

ENV PORT=3000
EXPOSE ${PORT}

CMD ["bun", "run", "index.js"]