FROM ruby

RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x wait-for-it.sh

ARG GLUE_REPO=omerlh
ARG GLUE_BRACNH=fix_zap_alerts_bug

RUN mkdir /glue && \
    cd /glue && \
    wget https://github.com/$GLUE_REPO/glue/archive/$GLUE_BRACNH.tar.gz && \
    tar -zxvf $GLUE_BRACNH.tar.gz --strip-components=1 && \
    rm -rf $GLUE_BRACNH.tar.gz && \
    bundle install

# ENTRYPOINT [ "ruby", "/glue/bin/glue" ]
