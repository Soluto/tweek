# ---- Base ----
FROM node:10.15.0-alpine AS base

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
EXPOSE 3000

WORKDIR /opt/app/

COPY --from=build /src/build/ ./build
COPY --from=deps /src/node_modules ./node_modules
COPY --from=deps /src/package.json ./package.json
COPY --from=build /src/index.js ./index.js

VOLUME [ "/opt/app/build/config" ]

HEALTHCHECK --interval=10s --timeout=10s --retries=8 \
      CMD wget -O - http://localhost:3000/health || exit 1
CMD [ "node", "index.js" ]
