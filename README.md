# <img src="https://soluto.github.io/docs.tweek.fm/assets/logo-with-background.png" width="400" />

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=Soluto&repoName=tweek&branch=master&pipelineName=tweek-all&accountName=soluto&key=eyJhbGciOiJIUzI1NiJ9.NTkwOTg1MmQ2ZDAxYjcwMDA2Yjc1ODBm.fODYFsnTAGVNVeEAA6lI0g-sTAfHjh5B9BWrOtDvSSE&type=cf-2)]( https://g.codefresh.io/repositories/Soluto/tweek/builds?filter=trigger:build;branch:master;service:590b2586eea36f000875f02e~tweek-all) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/containous/traefik/blob/master/LICENSE.md) [![Dependency Status](https://www.versioneye.com/user/projects/596654446725bd00487bd48e/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/596654446725bd00487bd48e)

### What is Tweek?

Tweek is an open source feature management solution for customizing applications and system behavior without deploying new code.

Tweek aims to be a complete open-source alternative to other industry feature/configuration/experiment management solutions such as Facebook's Gatekeeper, LinkedIn's XLNT, Dropbox's Stormcrow and other commercial SaaS solutions...

#### Features
- Feature toggles, gradual release
- Multi-variant experiments, A/B testing
- Built-in Editor with user friendly UI
- Hierarchical configurations
- Advanced targeting of users/groups
- Dependencies between features
- Customizable schema/domain model
- Auditing
- Integrated storage for saving context  
- Container friendly
- Integrated OAuth support
- Pluggable storage backend
- Simple RESTful api for fetching configurations
- Scalable

### Getting Started
The easiest way to start evaluating Tweek is to run it locally on docker, make sure you have the latest docker version (17-06+).
#### Running Tweek
- clone the repo
- go to deployments/dev
- run docker-compose up

#### Edit your first key
- Open http://editor.dev.local.tweek.fm:4000 in browser.
- Go to keys page.
- Click on "Add New Key"
- Type my_app/sign_button/color
- Add default value "red".
- Save changes.
- Click on "Add Rule"
- Set Property to Age (user) and set ">" and 18 in the other fields.
- In Rule value set the value "blue"

#### Querying Tweek
Use curl/postman/chrome to fire GET Request:
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/color -> expected to be "red"
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/color?user.Age=20 -> expected to be "blue"
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/_?user.Age=20 -> expected to be {"color":"blue"}

More on Tweek Rest api. (link)

#### Adding context data
Using the API, use curl/postman to fire POST Request:
- http://api.dev.local.tweek.fm:4000/api/v1/context/user/john {"Age":21}
After that, we can query Tweek API with:
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/color?user=john -> expected to be "blue"

More on Context. (link)

#### Gradual Feature Release
Create new key in the editor "my_app/sign_button/is_enabled" with value type "boolean"
Add new rule, set the the rule value to gradual release with 50%.
Try querying configuration with different users and You'll have different results.
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/is_enabled?user=barny
- http://api.dev.local.tweek.fm:4000/v1/keys/my_app/sign_button/is_enabled?user=robin
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/is_enabled?user=ted
- http://api.dev.local.tweek.fm:4000/api/v1/keys/my_app/sign_button/is_enabled?user=lily
- etc...

More on how multi-varaint keys work in Tweek. (link)

### Deployment to production

### FAQ
- Who's using Tweek?  
Tweek is been used in large scale production deployment in Soluto.

### Related projects
[Tweek.JPad](https://github.com/soluto/tweek.jpad) - Tweek's internal rules engine

### Additional Resources
- https://martinfowler.com/articles/feature-toggles.html
