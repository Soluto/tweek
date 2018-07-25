package rules

default get_user_and_group = { "user": null, "group": null }

get_user_and_group = { "user": input.sub, "group": "google" } {
    input.iss = "https://accounts.google.com"
} else = { "user": input.sub, "group": "azure" } {
    input.iss = "https://login.microsoftonline.com/11111111-1111-1111-1111-111111111111"
} 
