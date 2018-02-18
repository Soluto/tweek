FROM alpine:3.7

RUN apk add --no-cache openssh git bash curl && \
    ssh-keygen -A && \
    adduser -D -s /usr/bin/git-shell git && \
    echo git:12345 | chpasswd && \
    mkdir /home/git/.ssh && \
    git config --global user.email "git@tweek" && \
    git config --global user.name "git" && \
    mkdir /tweek && mkdir /tweek/repo && mkdir /tweek/tests && \
    cd /tweek/repo && git init --bare && \
    cd /tweek/tests && git init --bare

WORKDIR /tweek
COPY sshd_config /etc/ssh/sshd_config
COPY init.sh init.sh
COPY source ./source
COPY tests-source ./tests-source

RUN cd ./source && \
    git init && git add . && git commit -m "init"  && git push ../repo master && \
    cd - && rm -rf source && \
    cd ./tests-source && \
    git init && git add . && git commit -m "init"  && git push ../tests master && \
    cd - && rm -rf tests-source

VOLUME /tweek/repo

EXPOSE 22

CMD ["sh", "init.sh"]
