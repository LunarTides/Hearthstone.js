FROM oven/bun AS builder
WORKDIR /app

COPY package.json ./
COPY bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx
COPY --from=builder /app/dist /var/www/docs
