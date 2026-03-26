FROM oven/bun:1 AS builder
WORKDIR /app

# Install git to get version information.
RUN apt-get -y update
RUN apt-get -y install git

# Setup git repo
RUN git init
RUN git remote add origin https://github.com/LunarTides/Hearthstone.js
RUN git fetch origin --depth 1

COPY . .

RUN bun install
RUN bun run build

FROM oven/bun:1
WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY .env .
CMD [ "bun", "./build/index.js" ]
