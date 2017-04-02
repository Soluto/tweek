FROM node:6.10.0-slim

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3000

ENV PORT=3000
ENTRYPOINT ["node", "./server.js"]
