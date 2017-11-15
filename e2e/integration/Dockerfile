FROM node:8.9.1

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./

CMD ["yarn", "test"]
