# ------- BASE -------
FROM soluto/nodegit-alpine:8.1.4 as base

COPY package.json yarn.lock /tmp/
RUN ln -s /nodegit/node_modules /tmp/node_modules
RUN cd /tmp && yarn --prod

RUN mkdir -p /opt/app && ln -s /tmp/node_modules /opt/app/node_modules

# ------- TEST -------
FROM base as test
RUN cd /tmp && yarn

WORKDIR /opt/app
COPY . /opt/app

RUN yarn test

# ------- RELEASE -------
FROM base as release

WORKDIR /opt/app
COPY src/ /opt/app/src/

EXPOSE 3000

ENV PORT=3000
HEALTHCHECK --interval=10s --timeout=10s --retries=8 \
      CMD wget -O - http://localhost:3000/isalive || exit 1
ENTRYPOINT ["node", "./src/server.js"]
