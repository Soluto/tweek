# ---- Base ----
FROM node:8.9.1-alpine AS base

# ---- Deps ----
FROM base AS deps

WORKDIR /src/
COPY package.json yarn.lock ./
RUN yarn --prod

# ---- Build ----
FROM deps AS build

RUN yarn

COPY . ./
RUN yarn test && yarn build

# ---- Release ----
FROM base AS release

ENV NODE_ENV=production
ENV PORT=3000
ENV VAPID_KEYS=/opt/vapid/keys.json
EXPOSE 3000

WORKDIR /opt/app/
VOLUME /opt/vapid/

COPY --from=build /src/dist/ ./dist
COPY --from=build /src/build/ ./dist/build
COPY --from=deps /src/node_modules ./node_modules
COPY --from=deps /src/package.json ./package.json

HEALTHCHECK --interval=10s --timeout=10s --retries=8 \
      CMD wget -O - http://localhost:3000/health || exit 1
CMD [ "yarn", "start:release" ]
