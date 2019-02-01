FROM testcafe/testcafe

USER root

COPY package.json yarn.lock /tests/
RUN cd /tests && npm i --production
COPY . /tests

USER user
