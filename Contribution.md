# Project structure

- services (all tweek microservices)
   - api (rest api for getting configurations and updating context)
   - editor (admin ui for editing rules and managing Tweek)
   - management (CI and serving layer for new rules)
   - git-service (stand along git rules repository for dev & testing)
- deployments
   - dev (docker compose files for devlopment)
- e2e (full tests)


# Build tweek environment

## Requirements 
1. Docker compatible environment  (Windows 10/Mac/Linux)
2. Docker hub account with access to Soluto team

## Add Appveyor nuget source
1. Install nuget cli
2. run
mac: ```nuget sources add -Name solutoappveyor -Source https://ci.appveyor.com/nuget/soluto -Us
erName it@soluto.com -StorePasswordInClearText -ConfigFile ~/.nuge
t/NuGet/NuGet.Config -Password <Password>```
OR
3. You can edit manuallty global NuGet.Config

## Install runtime dependencis
1. Install .Net core (https://www.microsoft.com/net/download/core)
2. Install docker (https://www.docker.com/)
3. Install node 6+ (https://nodejs.org/en/)

## Running full environment
1. clone:
    ```
    git clone https://github.com/Soluto/tweek.git
    cd tweek
    ```
2. dotnet restore
3. dotnet publish services/api/Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj -o ./obj/Docker/publish
4. docker-compose -f ./deployments/dev/docker-compose.yml build
5. docker-compose -f ./deployments/dev/docker-compose.yml up -d

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
   ```docker-compose -f ./deployments/dev/docker-compose.yml up tweek-management -d```

2. Debug tweek in VS2017 or VSCODE tweek-api task
### TESTS

#### UNIT
1. Run in Visual studio 2017 
or
mac: find . -wholename '*.Tests.csproj' -print0 | xargs -0 -n 1 dotnet test (only with shell)

#### BLACKBOX/SMOKE
1. Run service
2. Run smoke tests in vs or run ```dotnet test services/api/Tweek.ApiService.SmokeTests/Tweek.ApiService.SmokeTests.csproj -c Release --no-build```

## Debugging Tweek editor




