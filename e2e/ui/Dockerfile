FROM testcafe/testcafe:1.5.0
USER root

COPY package.json yarn.lock /src/
RUN cd /src && npm i --production
COPY . /src

USER user
