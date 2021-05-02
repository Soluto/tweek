FROM node:16.0.0-alpine
ENV CI=true
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . /app
RUN yarn test
CMD [ "yarn", "start" ]
