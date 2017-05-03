FROM microsoft/aspnetcore:1.1.1
ARG source
RUN ls -a && pwd
EXPOSE 80
COPY ${source:-./obj/Docker/publish} /app
WORKDIR /app
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
