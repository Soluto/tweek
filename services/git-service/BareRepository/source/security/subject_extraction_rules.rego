package rules

default subject = { "user": null, "group": null }

subject = { "user": "admin-app", "group": "externalapps"} {
    input.iss = "http://localhost:8081"
    input.aud = "tweek-openid-mock-client"
} else = { "user": input.sub, "group": "default" } {
    true
}