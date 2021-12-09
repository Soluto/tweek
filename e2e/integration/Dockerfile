FROM node:16.0.0-alpine

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install

COPY . ./

CMD ["yarn", "test"]
