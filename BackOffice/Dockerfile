FROM node:6.9.1

ADD package.json /tmp/package.json
RUN wget https://yarnpkg.com/latest.tar.gz
RUN mkdir -p /opt/yarn
RUN tar -xf latest.tar.gz dist -C /opt/yarn --strip-components=1
RUN ls /opt/yarn
ENV PATH "$PATH:/opt/yarn/bin"

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
