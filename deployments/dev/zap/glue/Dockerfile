FROM ruby:2.4.2

RUN apt-get update && \
    apt-get install -y --no-install-recommends jq && \
    apt-get clean && \
    wget https://raw.githubusercontent.com/vishnubob/wait-for-it/8ed92e8cab83cfed76ff012ed4a36cef74b28096/wait-for-it.sh && \
    chmod +x wait-for-it.sh

ARG GLUE_REPO=omerlh
ARG GLUE_BRACNH=fix_zap_alerts_bug

RUN mkdir /glue && \
    cd /glue && \
    wget https://github.com/$GLUE_REPO/glue/archive/$GLUE_BRACNH.tar.gz && \
    tar -zxvf $GLUE_BRACNH.tar.gz --strip-components=1 && \
    rm -rf $GLUE_BRACNH.tar.gz && \
    bundle install
