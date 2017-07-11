# Tweek [![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=Soluto&repoName=tweek&branch=master&pipelineName=tweek-all&accountName=soluto&key=eyJhbGciOiJIUzI1NiJ9.NTkwOTg1MmQ2ZDAxYjcwMDA2Yjc1ODBm.fODYFsnTAGVNVeEAA6lI0g-sTAfHjh5B9BWrOtDvSSE&type=cf-2)]( https://g.codefresh.io/repositories/Soluto/tweek/builds?filter=trigger:build;branch:master;service:590b2586eea36f000875f02e~tweek-all) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/containous/traefik/blob/master/LICENSE.md)

### What is Tweek?

Tweek is an open source feature management solution for changing and personalizing applications and system behavior dynamically, remotely, and in runtime independently from deployment/release cycles.

#### Features
- Feature toggles and gradual release
- Multi-variant experiments or a/b testing
- Powerful editor with user friendly UI
- Hierarchical configurations
- Advanced segmentation of users
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
The easiest way to start evaluating Tweek is to run it locally.  
-- add docker-compose instructions
#### Running Tweek

#### Edit your first key
- Open http://localhost:4004 in browser.
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
- http://localhost:4003/api/v1/keys/my_app/sign_button/color -> expected to be "red"
- http://localhost:4003/api/v1/keys/my_app/sign_button/color?user.Age=20 -> expected to be "blue"
- http://localhost:4003/api/v1/keys/my_app/sign_button/_?user.Age=20 -> expected to be {"color":"blue"}

More on Tweek Rest api. (link)

#### Adding context data
Using the API, use curl/postman to fire POST Request:
- http://localhost:4003/api/v1/context/user/john {"Age":21}
After that, we can query Tweek API with:
- http://localhost:4003/api/v1/keys/my_app/sign_button/color?user=john -> expected to be "blue"

More on Context. (link)

#### Gradual Feature Release
Create new key in the editor "my_app/sign_button/is_enabled" with value type "boolean"
Add new rule, set the the rule value to gradual release with 50%.
Try querying configuration with different users and You'll have different results.
- http://localhost:4003/api/v1/keys/my_app/sign_button/is_enabled?user=barny
- http://localhost:4003/api/v1/keys/my_app/sign_button/is_enabled?user=robin
- http://localhost:4003/api/v1/keys/my_app/sign_button/is_enabled?user=ted
- http://localhost:4003/api/v1/keys/my_app/sign_button/is_enabled?user=lily
- etc...

More on how multi-varaint keys work in Tweek. (link)

### Deployment to production

### FAQ

### Related projects
Tweek.JPad

### Additional Resources
