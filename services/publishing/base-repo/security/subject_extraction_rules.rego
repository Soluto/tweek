package rules

default subject = { "user": null, "group": null }

subject = { "user": input.upn, "group": "default"} {
    true
}