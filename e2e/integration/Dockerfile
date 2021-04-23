FROM node:15.4.0-alpine

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install

COPY . ./

CMD ["yarn", "test"]
