FROM node:14.7.0-alpine
ENV CI=true
WORKDIR /app
COPY package.json yarn.lock ./
COPY patches ./patches
RUN yarn
RUN yarn patch-package
COPY . /app
RUN yarn test 
CMD [ "yarn", "start" ]