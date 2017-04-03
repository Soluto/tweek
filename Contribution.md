# Build tweek environment

## Requirements 
1. Docker compatible environment  (Windows 10/Mac/Linux)

## Add Appveyor nuget source
1. Install nuget cli
2. run
```nuget sources add -Name solutoappveyor -Source https://ci.appveyor.com/nuget/soluto -UserName it@soluto.com -Password <password>```
OR
3. You can edit manuallty global NuGet.Config

## Install runtime dependencis
1. Install dotnet cli
2. Install docker
3. Install node 6+

## Running full environment
1. clone:
    ```
    git clone https://github.com/Soluto/tweek.git
    cd tweek
    ```
2. dotnet restore
3. dotnet publish services/api/Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj","-o", "./obj/Docker/publish"
4. docker-compose -f /deployments/dev/docker-compose.yml build
5. docker-compose -f /deployments/dev/docker-compose.yml up -d

All tweek microservices should be run on ports 4001-4004:  
4001 - Git server (ssh)  
4002 - Management (http)  
4003 - Api (http)  
4004 - Editor (http)  

## Debugging Tweek api

### Install tools
VS CODE
1. Download VS Code: https://code.visualstudio.com/
2. Install C# extension: https://code.visualstudio.com/docs/languages/csharp

VS 2017
1. Install VS 2017

### RUN
1. If you haven't ran the full environment before, run management service: 
   ```docker-compose -f /deployments/dev/docker-compose.yml up tweek-management -d```

2. Debug tweek in VS2017 or VSCODE tweek-api task

## Debugging Tweek editor
