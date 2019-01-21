FROM node:10.15.0-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . /app
RUN yarn test 
CMD [ "yarn", "start" ]
