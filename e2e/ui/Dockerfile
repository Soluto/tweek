FROM testcafe/testcafe

USER root

COPY package.json yarn.lock /src/
RUN cd /src && npm i --production
COPY . /src

USER user
