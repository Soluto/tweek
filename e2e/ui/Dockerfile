FROM node:8.1.4

WORKDIR /opt/app
COPY package.json yarn.lock /opt/app/
RUN yarn install --production

COPY . /opt/app/

CMD ["yarn", "test", "--host", "selenium", "--port", "4444"]
