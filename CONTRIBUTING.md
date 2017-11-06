# Project structure

- services (all tweek microservices)
   - api (rest api for getting configurations and updating context)
   - authoring (rest api for reading and editing keys definitions/manifests)
   - editor (admin ui for editing rules and managing Tweek)
   - management ("CI" and serving layer for new rules)
   - git-service (stand-alone git rules repository for bootstrap, dev & testing)
- deployments
   - dev (docker compose files for devlopment)
- core
   - Tweek calculation lib (.Net)
- addons
   - Addons for Tweek api
- e2e (full system tests)
   - UI (full UI tests using selenium)
   - Integration (api, service interactions tests)

# Build & Run tweek environment

## Requirements 
1. Docker compatible environment  (Windows 10/Mac/Linux)

## Install runtime dependencies
1. Install .Net core (https://www.microsoft.com/net/core)
2. Install docker (https://www.docker.com/)
   - On windows, open docker setting through traybar and your working drive as shared drive (under shared drives)
3. Install node 8+ (https://nodejs.org/en/)

## Running full environment
1. clone:
   ```
   git clone https://github.com/Soluto/tweek.git
   cd tweek
   ```
2. `docker-compose -f ./deployments/dev/docker-compose.yml build`
3. `docker-compose -f ./deployments/dev/docker-compose.yml up -d`

All tweek microservices should be run on ports 4001-4004:  
4001 - Git server (ssh)  
4002 - Management (http)  
4003 - Api (http)  
4004 - Editor (http)  
4005 - Authoring (http)

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
   docker-compose -f ./deployments/dev/docker-compose.yml pull tweek-management tweek-git
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
- if you didn't change anything in the environment, you can just pull it from the server using this command:
   ```
   npm run docker-compose pull [SERVICES]
   ```
- if you made any changes in the environment, build it using this command:
   ```
   npm run docker-compose build [SERVICES]
   ```
- the possible services are: `tweek-git` `tweek-management` `tweek-api`
   #### examples:
   - get latest management and api version from server: 
      ```
      npm run pull-env tweek-management tweek-api
      ```
   - build local management version: 
      ```
      npm run build-env tweek-management
      ```

### debug
- if you haven't pulled or built the environment, run `npm run docker-compose pull tweek-git tweek-management tweek-api`
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
   npm run test:full-env:build
   ```
- our e2e tests are using selenium. If you don't have it installed, and you don't want to install it, you can just run the tests in docker. To do so replace `full-env` with `docker`:
   ```
   npm run test:docker
   npm run test:docker:build
   ```

## TEARDOWN
```
docker-compose -f ./deployments/dev/docker-compose.yml down --remove-orphans
```

## Contributing 
Create branch with the format {issueNumber}_{someName}  
Commit, push, create pull request

# Reporting security issues and bugs

Security issues and bugs should be reported privately, via email to tweek@soluto.com.
