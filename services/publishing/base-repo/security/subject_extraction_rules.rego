package rules

default subject = { "user": null, "group": null }

subject = { "user": input.email, "group": "default" } {
    count(input.email) != 0
} else = { "user": input.sub, "group": "default" } {
    count(input.sub) != 0
}