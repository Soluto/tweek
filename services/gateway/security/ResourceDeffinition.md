# Tweek resource format (work in progress)

### Rationale

We'd like to be able to represent tweek resources in a form similar to URI or URN. Useful application of this format could be permalinks, granting permissions to resources etc.

## Format deffinition

```
RESOURCE = CONTEXT_DEFFINITIONS ":" PROP_OR_KEY_DEFFINITION
CONTEXT_DEFFINITIONS = CONTEXT_DEFFINITION | CONTEXT_DEFFINITIONS "+" CONTEXT_DEFFINITION
CONTEXT_DEFFINITION = CONTEXT_TYPE "=" CONTEXT_ID
PROP_OR_KEY_DEFFINITION = "context/" CONTEXT_TYPE "." PROP_NAME | "values/" KEY_PATH "*" ? | "keys/" KEY_PATH "*" ? | "repo/tags" | "repo/schemas" | "repo"
PROP_NAME = [a-zA-Z]
KEY_PATH = [a-z0-9_/]
CONTEXT_TYPE = [a-z]
CONTEXT_ID = [a-zA-Z0-9%]
```

- `CONTEXT_ID` must contain only characters matching regular expression `[a-zA-Z0-9]` or `[%][0-9a-fA-F][0-9a-fA-F]` (percent encoding) . All other characters must be percent encoded.
- The order defines the precedence of evaluation by the API

## Exmaples

### Values resource with 'device' context

An example where values are requested for key named `/path/to/key` and device context identified as `a2df519d-4515-4732-b995-17172aaad7c1`

`device=a2df519d-4515-4732-b995-17172aaad7c1:values/path/to/key`

### Keys resource

An example where repo is queried for key named `/path/to/key`

`repo/keys/path/to/key`

### Values resource with 'user' context

An example where values are requested for key named `/user/specific/key` and user identified as `user@example.com`

`user=user@example.com:values/user/specific/key`

### Whole context

An example, which describes a whole context

`device=self:device.*`

### Specific context property

An example where specific context property is `device.OsType`

`device=a2df519d-4515-4732-b995-17172aaad7c1:device.OsType`
