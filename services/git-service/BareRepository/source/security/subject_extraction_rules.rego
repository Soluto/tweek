package rules

default subject = { "user": null, "group": null }

subject = { "user": "admin-app", "group": "externalapps"} {
    startswith(input.iss, "http://localhost:")
    input.aud = "tweek-openid-mock-client"
} else = { "user": input.sub, "group": "default" } {
    true
}