FROM node:6.10.3-slim

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3000

ENV PORT=3000
HEALTHCHECK --interval=10s --timeout=10s --retries=8 \
      CMD curl -f http://localhost:3000/isalive || exit 1
ENTRYPOINT ["node", "./server.js"]
