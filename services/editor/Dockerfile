FROM node:6.10.1-slim

ENV NODE_ENV=production

ADD package.json yarn.lock /tmp/
WORKDIR /tmp
RUN npm install --only=prod && mkdir -p /opt/app && cp -a node_modules /opt/app/node_modules && npm install --only=dev

ADD . /tmp/
RUN npm run test
RUN npm run build-prod && mv .build /opt/app/.build && rm -rf /tmp

WORKDIR /opt/app
EXPOSE 3000

ENV PORT=3000
ENTRYPOINT ["node", "./.build/server.js"]
