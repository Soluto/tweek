# ---- Base ----
FROM node:8.0.0-alpine AS base

COPY package.json yarn.lock /src/
WORKDIR /src/
RUN yarn --prod

# ---- Build ----
FROM base AS build

RUN yarn

COPY . /src/
RUN yarn build

# ---- Release ----
FROM node:8.0.0-alpine AS release

COPY --from=build /src/dist/ /opt/app/dist
COPY --from=build /src/build/ /opt/app/dist/build
COPY --from=base /src/node_modules/ /opt/app/node_modules
WORKDIR /opt/app/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT [ "node", "./dist/index.js" ]
