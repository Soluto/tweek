FROM node:8.7.0

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./

RUN chmod +x test.sh && \
    wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x wait-for-it.sh

CMD ["./test.sh"]
