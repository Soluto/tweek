FROM node:8.7.0

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./

CMD ["yarn", "test", "--host", "selenium", "--port", "4444"]
