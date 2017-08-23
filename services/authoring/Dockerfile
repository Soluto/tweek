# ------- BASE -------
FROM soluto/nodegit-alpine:8.1.4 as base

# ------- DEPS -------
FROM base as deps
COPY package.json yarn.lock /tmp/
RUN ln -s /nodegit/node_modules /tmp/node_modules
RUN cd /tmp && yarn --prod

RUN mkdir -p /opt/app && ln -s /tmp/node_modules /opt/app/node_modules

# ------- BUILD -------
FROM deps as build
RUN cd /tmp && yarn

WORKDIR /opt/app
COPY . /opt/app

RUN yarn build

# ------- TEST -------
FROM build as test

WORKDIR /opt/app

RUN yarn test

# ------- RELEASE -------
FROM base as release

WORKDIR /opt/app
COPY --from=build /opt/app/dist/ /opt/app/dist/
COPY --from=deps /tmp/node_modules /opt/app/node_modules
COPY --from=deps /tmp/package.json /opt/app/package.json

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["npm", "start:release"]

