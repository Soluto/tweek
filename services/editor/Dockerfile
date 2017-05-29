# ---- Dependencies ----
FROM node:6.10.3-slim AS dependencies

COPY package.json yarn.lock /tmp/
WORKDIR /tmp

RUN npm install --only=production

# ---- Build ----
FROM node:6.10.3 AS build

COPY package.json yarn.lock /tmp/
WORKDIR /tmp

COPY --from=dependencies /tmp/node_modules /tmp/node_modules
RUN npm install --only=dev

COPY . /tmp/
RUN npm run test
RUN npm run build-prod

# ---- Release ----
FROM node:6.10.3-slim AS release

COPY --from=dependencies /tmp/node_modules /opt/app/node_modules
COPY --from=build /tmp/.build /opt/app/.build

WORKDIR /opt/app
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENTRYPOINT ["node", "./.build/server.js"]
