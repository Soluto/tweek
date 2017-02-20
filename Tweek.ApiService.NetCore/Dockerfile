FROM microsoft/aspnetcore:1.1
ARG source
WORKDIR /app
EXPOSE 80
COPY ${source:-obj/Docker/publish} .
HEALTHCHECK --interval=15s --timeout=2s CMD curl --fail http://localhost/status || exit 1
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
