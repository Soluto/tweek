FROM microsoft/dotnet:2.0.4-runtime


RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openssh-client openssh-server git jq ruby \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tweek

# the dark magic on the second line changes the password to random
RUN adduser --disabled-password --shell /usr/bin/git-shell git 
# RUN echo git:$(grep -m32 -ao '[A-Za-z0-9]' /dev/urandom | xargs | tr -d ' ') | chpasswd 
RUN mkdir /home/git/.ssh

RUN ssh-keygen -A

# git configuration
RUN git config --global user.email "git@tweek"
RUN git config --global user.name "git"

# copying the hooks into container
RUN mkdir /tweek/tmp-hooks
COPY pre-receive.sh /tweek/tmp-hooks/pre-receive
COPY post-receive.sh /tweek/tmp-hooks/post-receive

# COPY sshd_config /etc/ssh/sshd_config
COPY init.sh init.sh
COPY webhook.sh webhook.sh
COPY services.sh services.sh
COPY ssh-helper.sh ssh-helper.sh

RUN chmod 700 services.sh && chmod 700 ssh-helper.sh && mkdir -p /var/run/sshd && chown -R git:git /tweek

# add healthcheck
ENV GIT_SSH=/tweek/ssh-helper.sh
EXPOSE 22

ENTRYPOINT ["bash", "init.sh"]