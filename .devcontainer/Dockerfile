FROM mcr.microsoft.com/vscode/devcontainers/base:focal
ENV SHELL=/usr/bin/zsh

## Set docker-in-docker
ARG USERNAME=automatic
ARG USER_UID=1000
ARG USER_GID=$USER_UID

ARG ENABLE_NONROOT_DOCKER="true"
# [Option] Use the OSS Moby Engine instead of the licensed Docker Engine
ARG USE_MOBY="true"

RUN wget https://raw.githubusercontent.com/microsoft/vscode-dev-containers/main/script-library/docker-in-docker-debian.sh
RUN bash ./docker-in-docker-debian.sh

VOLUME [ "/var/lib/docker" ]
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-19.03.9.tgz | \
    tar zxvf - --strip 1 -C /usr/bin docker/docker
    
RUN sed -i "/plugins=/c\plugins=(docker git golang dotnet)" /home/vscode/.zshrc
RUN curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

### Installing dotnet 7.0
RUN apt update; \
    apt install -y apt-transport-https && \
    apt update && \
    apt install -y dotnet-sdk-7.0

### Installing golang 1.14
RUN curl -L https://golang.org/dl/go1.14.linux-amd64.tar.gz | sudo tar -xz -C /usr/local
ENV PATH=$PATH:/usr/local/go/bin:/home/vscode/go/bin
ENV GO111MODULE=on
RUN apt-get install -y gccgo
USER vscode
RUN go get -v golang.org/x/tools/gopls \
              github.com/ramya-rao-a/go-outline 
USER root

### Install nodejs & Yarn
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt install -y nodejs gcc g++ make
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt update && apt install -y yarn

### Install Tilt
RUN curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
RUN npm i -g zx

ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
CMD [ "sleep", "infinity" ]