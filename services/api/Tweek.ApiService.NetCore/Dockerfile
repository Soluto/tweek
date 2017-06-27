FROM microsoft/aspnetcore:1.1.2
ARG source
WORKDIR /app
EXPOSE 80
COPY ${source:-obj/Docker/publish} .
HEALTHCHECK --interval=15s --timeout=15s --retries=8 \
      CMD curl -f http://localhost/health || exit 1
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
