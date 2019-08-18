FROM node:10.15.0-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . /app
RUN CI=true yarn test 
CMD [ "yarn", "start" ]
