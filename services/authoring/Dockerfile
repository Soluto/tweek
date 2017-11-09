# ------- BASE -------
FROM soluto/nodegit-alpine:8.1.4 as base
WORKDIR /opt/app

# ------- DEPS -------
FROM base as deps
COPY package.json yarn.lock ./
RUN ln -s /nodegit/node_modules ./node_modules && \
    yarn --prod

# ------- BUILD -------
FROM deps as build

RUN yarn
COPY . ./
RUN yarn test && yarn build

# ------- RELEASE -------
FROM base as release

COPY --from=build /opt/app/dist/ ./dist/
COPY --from=deps /opt/app/node_modules ./node_modules
COPY --from=deps /opt/app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000
HEALTHCHECK --interval=10s --timeout=10s --retries=8 \
      CMD wget -O - http://localhost:3000/health || exit 1
CMD ["yarn", "start:release"]
