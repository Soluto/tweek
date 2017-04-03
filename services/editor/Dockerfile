FROM node:6.10.1-slim

ADD package.json yarn.lock /tmp/

ENV NODE_ENV=production
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cd /opt/app && ln -s /tmp/node_modules 

ADD . /opt/app

WORKDIR /opt/app
EXPOSE 3000

ENV PORT=3000
RUN npm run build-prod
ENTRYPOINT ["node", "./.build/server.js"]