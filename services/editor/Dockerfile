# ---- Base ----
FROM soluto/nodegit-alpine:8.1.4 AS base

# ---- Deps ----
FROM base AS deps
COPY package.json yarn.lock /src/
RUN ln -s /nodegit/node_modules /src/node_modules
WORKDIR /src/
RUN yarn --prod

# ---- Build ----
FROM deps AS build

RUN yarn

COPY . /src/
RUN yarn test
RUN yarn build

# ---- Release ----
FROM base AS release

COPY --from=build /src/dist/ /opt/app/dist
COPY --from=build /src/build/ /opt/app/dist/build
COPY --from=deps /src/node_modules /opt/app/node_modules
COPY ./build-index/ /opt/app/build-index

WORKDIR /opt/app/
VOLUME /opt/vapid/

RUN yarn cache clean

ENV NODE_ENV=production
ENV PORT=3000
ENV VAPID_KEYS=/opt/vapid/keys.json
EXPOSE 3000

ENTRYPOINT [ "node", "./dist/index.js" ]