# Overview

Allows setting hooks on keys (including the `*` wildcard). Only notification webhooks are supported at this time.
Paths for hooks implicitly start after the `implementations`/`manifests` prefixes.

# UI

Hooks can be edited in the settings page, under the `Hooks` entry in the menu.
There are also links from the key page to create or view hooks for this key.

# Storage

Centralized storage in a JSON file at the git repo. Format:

```JSON
[
  {
    "id": "auto_generated_uid",
    "keyPath": "path/to/key",
    "type": "notification_webhook",
    "format": "json",
    "url": "http://some-domain/awesome_hook"
  },
  {
    "id": "auto_generated_uid",
    "keyPath": "wildcard/path/*",
    "type": "notification_webhook",
    "format": "json",
    "url": "http://some-other-domain/another_awesome_hook"
  }
]
```

# API

All GET APIs return an `ETag` header and all POST/PUT/DELETE APIs can optionally accept an `If-Match` header.

## List all hooks

`GET /api/v2/hooks/?keyPathFilter=url_encoded_key_path`

The `keyPathFilter` query param is optional and filters results to that exact keyPath (not evaluating wildcards)

Response:

```JSON
[
   {
      "id": "auto_generated_uid",
      "keyPath":"path/to/key",
      "type":"notification_webhook",
      "format": "json",
      "url":"http://some-domain/hook"
   },
   {
      "id": "auto_generated_uid",
      "keyPath":"path/to/key",
      "type":"notification_webhook",
      "format": "json",
      "url":"http://another-domain/hook"
   },
   {
      "id": "auto_generated_uid",
      "keyPath":"wildcard/path/*",
      "type":"notification_webhook",
      "format": "json",
      "url":"http://some-domain/hook"
   }
]
```

## Create a hook

`POST /api/v2/hooks`

Request body:

```JSON
{
  "keyPath": "path/to/key",
  "type": "notification_webhook",
  "format": "json",
  "url": "http://hook-url"
}
```

## Update a hook

`PUT /api/v2/hooks/:id`

Request body:

```JSON
{
  "keyPath": "path/to/key",
  "type": "notification_webhook",
  "format": "json",
  "url": "http://hook-url"
}
```

## Delete a hook

`DELETE /api/v2/hooks/:id`

# The webhook request

Based on the format, it will format the call:

## JSON format

POST request with JSON content showing the new state of the keys.
**Notes**:

- `implementation` is a string, and it might also be null depending on the key format
- `oldValue` will be null when the key was newly created in this commit
- `newValue` will be null when the key was archived

Example request body:

```JSON
{
  "author": {
    "name": "author name",
    "email": "author@email.com"
  },
  "updates": [
    {
      "newValue": {
        "keyPath": "a/b/c",
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
        },
        "implementation": "{
          \"partitions\": [],
          \"valueType\": \"string\",
          \"rules\": [
            {
              \"Matcher\": {
                \"user.Country\": \"AA\"
              },
              \"Value\": \"19\",
              \"Type\": \"SingleVariant\"
            }
          ],
          \"defaultValue\": \"15\"
        }"
      },
      "oldValue": {
        "keyPath": "a/b/c",
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
        },
        "implementation": "{
          \"partitions\": [],
          \"valueType\": \"string\",
          \"rules\": [
            {
              \"Matcher\": {
                \"user.Country\": \"AA\"
              },
              \"Value\": \"19\",
              \"Type\": \"SingleVariant\"
            }
          ],
          \"defaultValue\": \"17\"
        }"
      }
    }
  ]
}
```

## Slack format

POST to a Slack webhook with a descriptive message on the event

Example request body:

```JSON
{
  "text": "Tweek key changed!..."
}
```
