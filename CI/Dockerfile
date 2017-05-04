FROM microsoft/aspnetcore-build:1.0-1.1

RUN mkdir /config
RUN apt update && apt install gettext -y
COPY NuGet.Config.tmpl NuGet.Config.tmpl
RUN envsubst < ./NuGet.Config.tmpl > config/NuGet.Config

WORKDIR config

CMD [ "tail", "-t", "/dev/null" ]
