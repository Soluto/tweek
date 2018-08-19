package rules

default subject = { "user": null, "group": null }

subject = { "user": input.sub, "group": "default" }
