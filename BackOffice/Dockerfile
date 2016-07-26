FROM node:4.3.2

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3000

ENV PORT=80
ENV NODE_ENV=production
RUN npm run build-prod
ENTRYPOINT ["node", "./.build/server.js"]
