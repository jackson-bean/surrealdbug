FROM oven/bun:1.3.2

WORKDIR /app
COPY ./client/dist ./public
COPY ./server ./

RUN bun install

ENV PORT=3000
ENV PUBLIC_DIR="/app/public"

CMD ["bun", "src/index.ts"]