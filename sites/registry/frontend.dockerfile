FROM oven/bun AS builder
WORKDIR /app

COPY package.json ./
COPY bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun
WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY .env .
EXPOSE ${PORT}
CMD [ "bun", "./build/index.js" ]
