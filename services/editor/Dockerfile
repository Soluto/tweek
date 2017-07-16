# ---- Base ----
FROM soluto/nodegit-alpine:8.1.4 AS base

COPY package.json yarn.lock /src/
RUN ln -s /nodegit/node_modules /src/node_modules
WORKDIR /src/
RUN yarn --prod

# ---- Build ----
FROM base AS build

RUN yarn

COPY . /src/
RUN yarn test
RUN yarn build

# ---- Release ----
FROM base AS release

COPY --from=build /src/dist/ /opt/app/dist
COPY --from=build /src/build/ /opt/app/dist/build
RUN ln -s /src/node_modules /opt/app/node_modules
COPY ./build-index/ /opt/app/build-index

WORKDIR /opt/app/
VOLUME /opt/vapid/

ENV NODE_ENV=production
ENV PORT=3000
ENV VAPID_KEYS=/opt/vapid/keys.json
EXPOSE 3000

ENTRYPOINT [ "node", "./dist/index.js" ]
