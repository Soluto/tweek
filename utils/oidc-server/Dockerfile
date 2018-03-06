###########
FROM microsoft/aspnetcore-build:2.0.5-2.1.4 as source
ARG target="Release"

WORKDIR /src
COPY ./oidc-server.sln ./oidc-server.sln
COPY ./OpenIdConnectServer/OpenIdConnectServer.csproj ./OpenIdConnectServer/OpenIdConnectServer.csproj
RUN dotnet restore

COPY . .

RUN dotnet publish -c $target -o obj/docker/publish

RUN cp -r /src/OpenIdConnectServer/obj/docker/publish /OpenIdConnectServer

FROM microsoft/aspnetcore:2.0.5
ARG target="Release"

RUN if [ $target = "Debug" ]; then apt-get update && apt-get install unzip && rm -rf /var/lib/apt/lists/* && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg; fi

COPY --from=source /OpenIdConnectServer /OpenIdConnectServer
WORKDIR /OpenIdConnectServer

EXPOSE 80

HEALTHCHECK --interval=60s --timeout=2s --retries=8 \
      CMD curl -f http://localhost/health || exit 1
      
ENTRYPOINT ["dotnet", "OpenIdConnectServer.dll" ]