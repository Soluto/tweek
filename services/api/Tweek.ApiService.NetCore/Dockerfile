FROM microsoft/aspnetcore:1.1.1
ARG source
RUN ls -a && pwd
WORKDIR /app
EXPOSE 80
COPY ${source:-obj/Docker/publish} .
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
