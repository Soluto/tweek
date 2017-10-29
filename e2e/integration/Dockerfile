FROM node:8.7.0

WORKDIR /opt/app
COPY package.json yarn.lock /opt/app/
RUN yarn install --production

COPY . /opt/app/

CMD ["yarn", "test"]
