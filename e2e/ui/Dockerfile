FROM node:8.9.1

RUN apt-get update && \
    apt-get install -y --no-install-recommends jq && \
    apt-get clean && \
    wget https://raw.githubusercontent.com/vishnubob/wait-for-it/8ed92e8cab83cfed76ff012ed4a36cef74b28096/wait-for-it.sh && \
    chmod +x wait-for-it.sh

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./

CMD ["./test.sh"]
