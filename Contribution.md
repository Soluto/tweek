# Project structure

- services (all tweek microservices)
   - api (rest api for getting configurations and updating context)
   - editor (admin ui for editing rules and managing Tweek)
   - management ("CI" and serving layer for new rules)
   - git-service (stand along git rules repository for dev & testing)
- deployments
   - dev (docker compose files for devlopment)
- core
   - Tweek calculation lib (.Net)
- addons
   - Addons for Tweek api
- e2e (full system tests)

# Build & Run tweek environment

## Requirements 
1. Docker compatible environment  (Windows 10/Mac/Linux)
2. Docker hub account with access to Soluto team

## Install runtime dependencis
1. Install .Net core (https://www.microsoft.com/net/core)
2. Install docker (https://www.docker.com/)
   - Log in to Docker hub: `docker login -u <user> -p <password>`
   - On windows, open docker setting through traybar and your working drive as shared drive (under shared drives)
3. Install node 6+ (https://nodejs.org/en/)

## Add Appveyor nuget source
1. Install nuget cli (mac:brew install nuget, windows: https://dist.nuget.org/index.html)
2. dotnet restore`
3. run `nuget sources add -Name solutoappveyor -Source https://ci.appveyor.com/nuget/soluto -UserName it@soluto.com -StorePasswordInClearText -Password <Password>`

OR
4. You can edit manuallty global NuGet.Config instead

## Running full environment
1. clone:
   ```
   git clone https://github.com/Soluto/tweek.git
   cd tweek
   ```
2. `dotnet restore`
3.  if you're getting an error, run:
- mac: 
   ```
   nuget sources add -Name solutoappveyor -Source https://ci.appveyor.com/nuget/soluto -UserName it@soluto.com -StorePasswordInClearText -ConfigFile ~/.nuget/NuGet/NuGet.Config -Password <Password>
   ```
   - windows:
   ```
   nuget sources add -Name solutoappveyor -Source https://ci.appveyor.com/nuget/soluto -UserName it@soluto.com -StorePasswordInClearText -Password <Password>
   ```
   
4. `dotnet publish services/api/Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj -o ./obj/Docker/publish`  
5. `docker-compose -f ./deployments/dev/docker-compose.yml build`
6. `docker-compose -f ./deployments/dev/docker-compose.yml up -d`

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
1. If you haven't built the full environment before, pull management service: 
   ```
   docker-compose -f ./deployments/dev/docker-compose.yml pull tweek-management
   ```
2. If you haven't ran the full environment before, run management service: 
   ```
   docker-compose -f ./deployments/dev/docker-compose.yml up -d tweek-management
   ```
3. Debug tweek in VS2017 or VSCODE tweek-api task

### TESTS

#### UNIT
1. Run in Visual studio 2017 
or
mac: find . -wholename '*.Tests.csproj' -print0 | xargs -0 -n 1 dotnet test (only with shell)

#### BLACKBOX/SMOKE
1. Run service
2. Run smoke tests in VS or run:
   ```
   dotnet test services/api/Tweek.ApiService.SmokeTests/Tweek.ApiService.SmokeTests.csproj -c Release --no-build
   ```

## Debugging Tweek editor
1. go to services\editor
2. run npm i/yarn

### environment
- to get that latest environment version from the server:
   ```
   npm run pull-env
   ```
- to build environment with local changes:
   ```
   npm run build-env
   ```
- if you want to pull/build only part of the services and not all of them, add `-- [SERVICES]` at the end of the command.
   The options are: `tweek-git` `tweek-management` `tweek-api` `tweek-backoffice`
   #### examples:
   - get latest management and api version from server: 
      ```
      npm run pull-env -- tweek-management tweek-api
      ```
   - build local management version: 
      ```
      npm run build-env -- tweek-management
      ```

### debug
- if you haven't pulled or built the environment, run `npm run pull-env`
- run `npm run start:full-env`

### unit test
- run `npm test`

## E2E
1. go to e2e folder
2. run npm i/yarn

### run tests
- if you didn't make any changes to editor, or already built it:
   ```
   npm run test:full-env
   ```
- to rebuild editor and then run tests:
   ```
   npm run test:full-env:rebuild
   ```

## TEARDOWN
```
docker-compose -f ./deployments/dev/docker-compose.yml down
```

## Contributing 
Create branch with the format {issueNumber}_{someName}  
Commit, push, create pull request


