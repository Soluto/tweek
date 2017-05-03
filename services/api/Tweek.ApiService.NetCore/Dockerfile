FROM microsoft/aspnetcore:1.1.1
RUN ls -a && pwd
EXPOSE 80
COPY ./obj/Docker/publish /app
WORKDIR /app
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
