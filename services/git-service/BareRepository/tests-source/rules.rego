package rules

default get_user_and_group = { "user": null, "group": null }

get_user_and_group = { "user": input.sub, "group": "default" }
