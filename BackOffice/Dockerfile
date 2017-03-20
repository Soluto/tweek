FROM node:6.10.0

ADD package.json /tmp/package.json
ADD package.json yarn.lock /tmp/

RUN cd /tmp && yarn
RUN mkdir -p /opt/app && cd /opt/app && ln -s /tmp/node_modules 

ADD . /opt/app

WORKDIR /opt/app
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
RUN npm run build-prod
ENTRYPOINT ["node", "./.build/server.js"]