FROM node:8.1.2

COPY package.json npm-shrinkwrap.json /tmp/
RUN cd /tmp && \
    npm install --only=production && \
    mkdir -p /opt/app && \
    cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY . /opt/app

EXPOSE 3000

ENV PORT=3000
HEALTHCHECK --interval=10s --timeout=10s --retries=8 \
      CMD curl -f http://localhost:3000/isalive || exit 1
ENTRYPOINT ["node", "./server.js"]
