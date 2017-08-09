FROM node:8.1.4

ADD package.json yarn.lock /tmp/

RUN cd /tmp && yarn install --production
RUN mkdir -p /opt/app && cd /opt/app && ln -s /tmp/node_modules 

ADD . /opt/app

WORKDIR /opt/app
CMD ["yarn", "test"]
