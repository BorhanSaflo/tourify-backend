FROM node:21-alpine

WORKDIR /app

ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY ./package.json /app/package.json
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml
COPY ./drizzle.config.ts /app/drizzle.config.ts
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY ./src /app/src
COPY ./drizzle /app/drizzle
COPY ./tsconfig.json /app/tsconfig.json
RUN mkdir -p /app/data
RUN pnpm run push
RUN pnpm run build

COPY ./.env /app/.env

CMD ["pnpm", "run", "start"]