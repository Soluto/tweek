# <img src="https://soluto.github.io/docs.tweek.fm/assets/logo-with-background.png" width="400" />

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=Soluto&repoName=tweek&branch=master&pipelineName=tweek-all&accountName=soluto&key=eyJhbGciOiJIUzI1NiJ9.NTkwOTg1MmQ2ZDAxYjcwMDA2Yjc1ODBm.fODYFsnTAGVNVeEAA6lI0g-sTAfHjh5B9BWrOtDvSSE&type=cf-2)]( https://g.codefresh.io/repositories/Soluto/tweek/builds?filter=trigger:build;branch:master;service:590b2586eea36f000875f02e~tweek-all) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/soluto/tweek/blob/master/LICENSE.md) [![Slack](https://tweek-slack.now.sh/badge.svg)](https://tweek-slack.now.sh) [![CircleCI](https://circleci.com/gh/Soluto/tweek/tree/master.svg?style=svg)](https://circleci.com/gh/Soluto/tweek/tree/master)


tweek@soluto.com  

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
The easiest way to start evaluating Tweek is to run it locally on docker, make sure you have the latest [docker (for windows/mac/etc..)](https://www.docker.com/get-docker) version installed (17-06+).
#### Running Tweek
- clone the repo (``` git clone https://github.com/Soluto/tweek.git ```)
- run (``` yarn start ```) - this might take a few minutes for the first time

#### Edit your first key
After setting up our environment, we're going to create our first key.
Keys in tweek are the most basic building blocks and they reperesent a container for dynamic value that affect feature behaviors.
Our first key, will be a key that responsible for the the color of a "sign up" button.

- Open http://editor.dev.tweek.localtest.me:81 in browser.
- Go to keys page.
- Click on "Add Key"
- Type my_app/sign_button/color
- Set value type to String
- Add default value "red"
- Save changes
- Click on "Add Rule"
- Set Property to Country (user) and set "=" and "Canada" in the other fields
- In Rule value set the value "blue"
- Click "Save changes"

More on [keys and paths](https://docs.tweek.fm/concepts/keys/keys-ands-paths)

#### Querying Tweek
Use curl/postman/chrome to fire GET Request:
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/color -> expected to be "red"
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/color?user.Country=canada -> expected to be "blue"
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/_?user.Country=canada -> expected to be {"color":"blue"}

Using the rest api, an application can query Tweek for getting the right set of values for each specific user.
More on Tweek [Rest api](https://docs.tweek.fm/api/rest-api).

#### Adding context data
Tweek provide's REST api for saving context data. 
Using the API, use curl/postman to fire POST Request:
- http://api.dev.tweek.localtest.me:81/api/v1/context/user/john {"Country":"Canada"}  

After that, we can query Tweek API with:
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/color?user=john -> expected to be "blue"

More on [Context.](https://docs.tweek.fm/concepts/context/intro-to-context)

#### Gradual Feature Release
Create new key in the editor "my_app/sign_button/is_enabled" with value type "boolean" and default value False.  
Add new rule, remove all conditions, set the the rule value to gradual release with 50%.
Try querying configuration with different users and You'll have different results.
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/is_enabled?user=barny
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/is_enabled?user=robin
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/is_enabled?user=ted
- http://api.dev.tweek.localtest.me:81/api/v1/keys/my_app/sign_button/is_enabled?user=lily
- etc...

More on how multi-varaint keys work in Tweek. (link)

### Deployment to production

### FAQ
- Who's using Tweek?  
  Tweek is been used in large scale production deployment at Soluto.
- How do I generate ssh keys and a pfx file for use in production?  
  There's a script for this purpose in `utils/generate_keys.sh`
- I found a security vulnerability, should I open an issue about it?  
  No. Please send an email to `security@soluto.com`.


### Related projects
[Tweek.JPad](https://github.com/soluto/tweek.jpad) - Tweek's internal rules engine

### Additional Resources
- https://martinfowler.com/articles/feature-toggles.html
- https://en.wikipedia.org/wiki/Feature_toggle
