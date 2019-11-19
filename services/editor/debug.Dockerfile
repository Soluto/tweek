FROM node:10.15.0-alpine

WORKDIR /app
COPY package.json yarn.lock ./
COPY patches ./patches
RUN yarn
RUN yarn patch-package
COPY . /app
RUN CI=true yarn test 
CMD [ "yarn", "start" ]
