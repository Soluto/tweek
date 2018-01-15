FROM microsoft/aspnetcore-build:2.0.3 as source
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openssh-client openssh-server git \
    && rm -rf /var/lib/apt/lists/* \
    && adduser --disabled-password --shell /usr/bin/git-shell git \
    && mkdir /home/git/.ssh \
    && ssh-keygen -A \
    && git config --global user.email "git@tweek" \
    && git config --global user.name "git" 

WORKDIR /tweek
COPY ./Tweek.Publishing.sln ./Tweek.Publishing.sln
COPY ./Tweek.Publishing.Verifier/Tweek.Publishing.Verifier.csproj ./Tweek.Publishing.Verifier/Tweek.Publishing.Verifier.csproj
COPY ./Tweek.Publishing.Service/Tweek.Publishing.Service.csproj ./Tweek.Publishing.Service/Tweek.Publishing.Service.csproj
RUN dotnet restore

COPY . .

RUN dotnet publish -c Release \
    && chmod 700 ssh-helper.sh \
    && mkdir -p /var/run/sshd \
    && chown -R git:git /tweek

# add healthcheck
ENV GIT_SSH=/tweek/ssh-helper.sh
EXPOSE 22
EXPOSE 80

ENTRYPOINT ["bash", "init.sh"]