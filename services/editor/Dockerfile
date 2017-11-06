# ---- Base ----
FROM node:8.7.0-alpine AS base

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

CMD [ "yarn", "start:release" ]
