# ---- *.csproj FILES ----
FROM debian:stretch-slim as csproj-files
COPY ./addons /src/addons
COPY ./core /src/core
COPY ./services/api /src/services/api
RUN find /src -type f -not -name "*.csproj" -delete && find /src -type d -empty -delete

# ---- BUILD & TEST ----
FROM mcr.microsoft.com/dotnet/sdk:5.0 as source
ARG target="Release"
WORKDIR /src
COPY --from=csproj-files /src .
COPY ./Tweek.sln .
RUN dotnet restore ./Tweek.sln

COPY . .
RUN dotnet build Tweek.sln -c $target && \
    find . -regex '.*\.Tests\.csproj' -print0 | xargs -0 -n 1 -P 16 dotnet test -c $target --no-build && \
    cd ./services/api/Tweek.ApiService && dotnet publish Tweek.ApiService.csproj -c $target -o ./obj/Docker/publish

# ---- RELEASE ----
FROM mcr.microsoft.com/dotnet/aspnet:5.0 as release
ARG target="Release"
WORKDIR /app
EXPOSE 80

### ---- DEBUG ----
 RUN if [ $target = "Debug" ]; then apt-get update && apt-get install unzip && rm -rf /var/lib/apt/lists/* && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg; fi

COPY --from=source /src/services/api/Tweek.ApiService/obj/Docker/publish .
HEALTHCHECK --interval=15s --timeout=15s --retries=8 \
      CMD curl -f http://localhost/health || exit 1
ENTRYPOINT ["dotnet", "Tweek.ApiService.dll"]
