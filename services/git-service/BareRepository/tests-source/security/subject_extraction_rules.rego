package rules

default subject = { "user": null, "group": null }

subject = { "user": "admin-app", "group": "externalapps"} {
    input.iss = "http://oidc-server-mock"
    input.aud = "tweek-openid-mock-client"
} else = { "user": input.sub, "group": "default" } {
    true
}
