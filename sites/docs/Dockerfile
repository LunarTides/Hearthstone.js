FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json ./
COPY bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
COPY --from=builder /app/dist /var/www/docs
