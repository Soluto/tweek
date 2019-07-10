# Overview

Allows setting hooks on keys (including the `*` wildcard). Only notification webhooks are supported at this time.  
Paths for hooks implicitly start after the `implementations`/`manifests` prefixes.

# UI

## This section is still a WIP

UI editing through the menu in settings page. List view of all hooks (array of hooks on each key flattened for display), each hook edited individually (using the key and index in array of hooks for the key).
There will be some link from the key edit page to seeing the list of hooks filtered to showing only hooks for this key, and a link for the create hook page (with the key pre-filled)

TODO: Rewrite this section after the UI is implemented

# Storage

Centralized storage in a JSON file at the git repo. Format:

```JSON
[
  {
    "keyPath": "path/to/key",
    "hooks": [
      { "type": "notification_webhook", "url": "http://some-domain/awesome_hook" },
      { "type": "notification_webhook", "url": "http://some-domain/another_awesome_hook" }
    ]
  },
  { "keyPath": "wildcard/path/*", "hooks": [...] }
]
```

# API

## List all hooks

`GET /hooks`

Response:

```JSON
[
   {
      "keyPath":"path/to/key",
      "type":"notification_webhook",
      "url":"http://some-domain/hook",
      "hookIndex":0
   },
   {
      "keyPath":"path/to/key",
      "type":"notification_webhook",
      "url":"http://another-domain/hook",
      "hookIndex":1
   },
   {
      "keyPath":"wildcard/path/*",
      "type":"notification_webhook",
      "url":"http://some-domain/hook",
      "hookIndex":0
   }
]
```

## List hooks for a specific keyPath

`GET /hooks/:keyPath`

Response:

```JSON
[
   {
      "keyPath":"path/to/key",
      "type":"notification_webhook",
      "url":"http://some-domain/hook",
      "hookIndex":0
   },
   {
      "keyPath":"path/to/key",
      "type":"notification_webhook",
      "url":"http://another-domain/hook",
      "hookIndex":1
   }
]
```

## Create a hook

`POST /hooks/:keyPath/?author.name=name&author.email=email`

Request body:

```JSON
{
  "type": "notification_webhook",
  "url": "http://hook-url"
}
```

## Update a hook

`PUT /hooks/:keyPath/?hookIndex=2&author.name=name&author.email=email`

Request body:

```JSON
{
  "type": "notification_webhook",
  "url": "http://hook-url"
}
```

## Delete a hook

`DELETE /hooks/:keyPath/?hookIndex=1&author.name=name&author.email=email`

# The webhook request

POST request with JSON content showing the new state of the keys

Example request body:

```JSON
[
  {
    "keyPath": "a/b/c",
    "implementation": {
      "partitions": [],
      "valueType": "string",
      "rules": [
        {
          "Matcher": {
            "user.Country": "AA"
          },
          "Value": "19",
          "Type": "SingleVariant"
        }
      ],
      "defaultValue": "15"
    },
    "manifest": {
      "key_path": "a/b/c",
      "meta": {
        "archived": false,
        "name": "a/b/c",
        "description": "",
        "tags": []
      },
      "implementation": {
        "type": "file",
        "format": "jpad"
      },
      "valueType": "string",
      "dependencies": []
    }
  }
]
```
