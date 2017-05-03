FROM microsoft/aspnetcore:1.1.1
ARG source
WORKDIR /app
EXPOSE 80
ADD ${source:-obj/Docker/publish} .
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
