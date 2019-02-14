---
layout: page
title: Identities, properties and schema
permalink: /concepts/context/schema
---

## Schema

Tweek allow to define schema for identities and their properties using special tweek keys.  
Usually, we'll want to add identities and properties for our domain, for example adding the property 'level' to identity 'user'
can be suited for gaming domain.

In order to do that, we can do it using the editor "settings" page.

This means we've just added a new property for our schema 'user.level' which use the type "number" (allow any json based number).    
Types that allowed are as follows:
- all primitve json types: string, number, bool
- date type
- external types defined under @tweek/custom/types/{typename}
- custom

### Custom types
A custom type is a json value with the following properties:
```
{
    "base": "can be any other primitive type", //required
    "allowedValues": ["value1", "value2"], //optional - array that limit the number of options
    "comparer": "comparername", //optional, required to support additional comparison operators as >, <. (comparer need to be registered in api)
    "validation": "some regex string", //optional - regex for validating input, currently not used by editor/api
}
```


When using external types, the json properties are defined as tweek keys.
For example: [version - custom type](https://github.com/Soluto/tweek/blob/master/services/git-service/BareRepository/source/manifests/%40tweek/custom_types/version.json)
