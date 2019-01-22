---
layout: page
title: Keys and paths
permalink: /concepts/keys/keys-ands-paths
---

## Key paths
Every key in tweek represent a dynamic value that is accessible by path.  
Key paths share similar structure and semantics of a file system paths or windows registry.  
Key paths are also compatible with urls, which make them very friendly to access by REST endpoints.  
Keys should be organized based on application context (service. UI Component, BL module).  
Additionally, keys should be descriptive to product owners.  

### Styling/Structure Guidelines
- Lower case
- Snake case (separated with “_”)
- No special characters: a-z, 0-9
- Prefixes are delimited by “/”
- Intuitive name that relates to the feature/flow/code
- Gradual name structure - make sure to think on code consumption (structure should support consuming a subset of configurations only)
- "@" prefix represent keys which are not discoverable by scan queries.

#### Examples
- my_app/onboarding/supported_screens
- my_service/user_discovery/is_enabled
- my_worker/collection_interval


### Dependent keys
Some of the keys in Tweek are used to create complex rules, or allow better control and reuse of rules.
These keys can be marked with "@" prefix so they won't be discoverable by scan operations.