FROM node:6.10.1-slim

ADD package.json /tmp/package.json

RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cd /opt/app && ln -s /tmp/node_modules 

ADD . /opt/app

WORKDIR /opt/app
CMD ["npm", "test"]