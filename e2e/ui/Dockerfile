FROM testcafe/testcafe

ENV SCREEN_WIDTH=1280
ENV SCREEN_HEIGHT=720
EXPOSE 1337 1338

USER root

COPY package.json yarn.lock /tests/
RUN cd /tests && npm i --production
COPY . /tests

USER user
