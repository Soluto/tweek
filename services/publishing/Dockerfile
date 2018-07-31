# State 1: Build
FROM microsoft/dotnet:2.1-sdk as source
ARG target="Release"

WORKDIR /utils
RUN curl -L -o opa https://github.com/open-policy-agent/opa/releases/download/v0.8.2/opa_linux_amd64
RUN chmod u+x ./opa

WORKDIR /src
COPY ./Tweek.Publishing.sln ./Tweek.Publishing.sln
COPY ./Tweek.Publishing.Service/Tweek.Publishing.Service.csproj ./Tweek.Publishing.Service/Tweek.Publishing.Service.csproj
COPY ./Tweek.Publishing.Tests/Tweek.Publishing.Tests.csproj ./Tweek.Publishing.Tests/Tweek.Publishing.Tests.csproj
RUN dotnet restore

COPY . .

RUN dotnet test ./Tweek.Publishing.Tests
RUN dotnet publish -c $target -o obj/docker/publish

RUN cp -r /src/scripts /tweek \
    && cp -r /src/hooks /tweek/hooks \
    && cp -r /src/Tweek.Publishing.Service/obj/docker/publish /tweek/Tweek.Publishing.Service

# Stage 2: Release
FROM microsoft/dotnet:2.1-aspnetcore-runtime as release
ARG target="Release"
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       openssh-client openssh-server git  \
       && rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --shell /usr/bin/git-shell git \
    && mkdir /home/git/.ssh \
    && ssh-keygen -A \
    && git config --global user.email "git@tweek" \
    && git config --global user.name "git" 

RUN if [ $target = "Debug" ]; then apt-get update && apt-get install unzip && rm -rf /var/lib/apt/lists/* && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg; fi

COPY --from=source /utils /tweek
COPY --from=source /tweek /tweek
ENV GIT_SSH=/tweek/ssh-helper.sh \
    REPO_LOCATION=/tweek/repo \
    SSHD_CONFIG_LOCATION=/tweek/sshd_config

RUN mkdir -p /var/run/sshd && chown -R git:git /tweek 
RUN chmod u+x /tweek/*.sh
WORKDIR /tweek



EXPOSE 22
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=15s --retries=8 \
      CMD curl -f http://localhost/health || exit 1
      
ENTRYPOINT ["bash", "-c", "/tweek/init-git.sh && dotnet /tweek/Tweek.Publishing.Service/Tweek.Publishing.Service.dll 2>/dev/stderr 1>/dev/stdout & tail -f /dev/null" ]
