# Project structure

- services (all tweek microservices)
   - api (rest api for getting configurations and updating context)
   - authoring (rest api for reading and editing keys definitions/manifests)
   - editor (admin ui for editing rules and managing Tweek)
   - publishing ("CI" and publishing bundles)
- dependencies
   - git-service (stand-alone git rules repository for bootstrap, dev & testing)
   - minio (object storage) - rules storage
   - redis/couchbase/mongo - context database
   - nats - pubsub
- deployments
  - dev (docker compose files for devlopment)
  - kubernetes - use together with Skaffold
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

1. Install .Net core (<https://www.microsoft.com/net/core)>
2. Install docker (<https://www.docker.com/)>
   - On windows, open docker setting through traybar and your working drive as shared drive (under shared drives)
3. Install node 8+ (<https://nodejs.org/en/)>

## Running full environment

1. clone:

   ```bash
   git clone https://github.com/Soluto/tweek.git
   cd tweek
   ```
2. Yarn start

Access Tweek gateway using localhost:8080.
Tweek gateway route all traffic to other resources based on: https://github.com/Soluto/tweek/blob/master/services/gateway/settings/settings.json
The root path redirect to Tweek Editor UI

If you use k8s (comes bundled with Docker for mac/pc, enable using UI), you can use Skaffold (https://github.com/GoogleContainerTools/skaffold).
The main benefit of using Skaffold is that it provide watch, build  for all Tweek services (editor has also support for hot code reloading).

After installing Skaffold, use ```Skaffold dev --port-forward=false```

## Debugging Tweek editor

1. go to services\editor
2. run yarn
3. run yarn start:full-env

### Debug

- if you haven't pulled or built the environment, run `npm run docker-compose pull tweek-git tweek-management tweek-api`
- run `npm run start:full-env`

### Unit Tests

- run `yarn test`

## E2E

1. go to e2e folder
2. run npm i/yarn

### run tests

- if you didn't make any changes to editor, or already built it:
   ```bash
   npm run test:full-env
   ```
- to rebuild editor and then run tests:
   ```bash
   npm run test:full-env:build
   ```
- our e2e tests are using selenium. If you don't have it installed, and you don't want to install it, you can just run the tests in docker. To do so replace `full-env` with `docker`:
   ```bash
   npm run test:docker
   npm run test:docker:build
   ```

## Tear Down

```bash
docker-compose -f ./deployments/dev/docker-compose.yml down --remove-orphans
```

## Contributing

Create branch with the format {issueNumber}_{someName}
Commit, push, create pull request

## Reporting security issues and bugs

Security issues and bugs should be reported privately, via email to tweek@soluto.com.
