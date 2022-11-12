package rules

default subject = { "user": null, "group": null }

subject = { "user": "admin-app", "group": "externalapps"} {
    startswith(input.iss, "https://localhost:")
    input.aud = "tweek-openid-mock-client"
    input.sub = "user"
} else = { "user": input.sub, "group": "default" } {
    true
}
