FROM alpine:3.4

RUN apk add --no-cache \
  openssh \
  git \
  bash \
  curl

RUN ssh-keygen -A

WORKDIR /tweek

RUN adduser -D -s /usr/bin/git-shell git \
  && echo git:12345 | chpasswd \
  && mkdir /home/git/.ssh

COPY source /tweek/source
COPY tests-source /tweek/tests-source
RUN git config --global user.email "git@tweek"
RUN git config --global user.name "git"
RUN mkdir repo && cd repo && git init --bare
RUN mkdir tests && cd tests && git init --bare
RUN cd ./source && git init && git add . && git commit -m "init"  && git push ../repo master
RUN cd ./tests-source && git init && git add . && git commit -m "init"  && git push ../tests master
COPY pre-receive.sh /tweek/repo/hooks/pre-receive
COPY pre-receive.sh /tweek/tests/hooks/pre-receive
VOLUME /tweek/repo

COPY sshd_config /etc/ssh/sshd_config
COPY init.sh init.sh

EXPOSE 22

CMD ["sh", "init.sh"]
