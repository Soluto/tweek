---
layout: page
title: Intro to context
permalink: /concepts/context/intro-to-context
---

## What is context?

Context is a collection of all the facts available in a single Tweek evaluation.
Context is evaluated against key's rules to retrieve the value, meaning:

Context + key definition = value

For example, assuming we have a key ```is_allowed_to_drive``` with rule:  

```default value: false```  
```User.Age > 18 then true```

If we send these requests to Tweek:  
```
GET http://localhost:8080/api/v2/values/is_allowed_to_drive -> false
GET http://localhost:8080/api/v2/values/is_allowed_to_drive?User.Age=20 -> true
```

In order to get the right values from Tweek, we need to provide Tweek the relevant context for the request. 

## Inline context vs remote context

While we can always pass context parameters in url, a different approach is to save context in Tweek for identity.
For example:
```
GET http://localhost:8080/api/v2/values/is_allowed_to_drive?User=john -> false
```
We've asked for the value of "is_allowed_to_drive" for user John, but Tweek doesn't know any facts about him, let's change it:
``` 
POST http://localhost:8080/api/v2/context/user/john
{
    "Age": 20
}
```
After adding the data, let's retry our first request:
```
GET http://localhost:8080/api/v2/keys/is_allowed_to_drive?User=john -> true
```

## Identities & Properties

You've noticed that we used "User.Age" and not simply "Age", the reason is that Tweek treat facts as properties on top of identities, for example:
```
GET http://localhost:8080/api/v2/keys/path/to/key?User=john&User.Country=england
```
1. Tweek understands that it need to get the values for identity user "john".
2. Tweek look at inline context to see relevant properties for this identity, for example "User.Country=england"
3. Tweek look at remote context to get all properties for identity user "john", from previous example it would be Age=20
4. Tweek merge inline and remote context to a single context.
5. Tweek evaluate the context against the requested key definition (rules)
6. Tweek send the results back to the user

  