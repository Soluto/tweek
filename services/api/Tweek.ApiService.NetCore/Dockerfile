FROM microsoft/aspnetcore:1.1.1
COPY obj/Docker/publish /app
WORKDIR /app
EXPOSE 80
ENTRYPOINT ["dotnet", "Tweek.ApiService.NetCore.dll"]
