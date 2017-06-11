# ---- Base ----
FROM node:6.10.3-slim AS base

COPY package.json yarn.lock /src/
WORKDIR /src/
RUN npm install --only=production

# ---- Build ----
FROM base AS build

RUN npm install --only=dev

COPY . /src/
RUN yarn test
RUN yarn build

# ---- Release ----
FROM node:6.10.3-slim AS release

COPY --from=build /src/dist/ /opt/app/dist
COPY --from=build /src/build/ /opt/app/dist/build
COPY --from=base /src/node_modules/ /opt/app/node_modules
COPY ./build-index/ /opt/app/build-index

WORKDIR /opt/app/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT [ "node", "./dist/index.js" ]
