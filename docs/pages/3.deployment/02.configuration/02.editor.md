---
layout: page
title: Editor
permalink: /deployment/configuration/editor
---

Tweek's editor can be configured by setting environment variables.

### Configuration authentication

In order to set authentication for Tweek, you need to add the following variables:
- ```REQUIRE_AUTH=true```
- ```TWEEK_AUTH_SCHEMES=*scheme1,scheme2,...*```

Current supported schemes are:
```google, azuread, oauth2, httpDigest```

For each auth scheme you need to add additional settings:
- google  
-- ```AUTH_GOOGLE_CLIENT_SECRET```  
-- ```AUTH_GOOGLE_CLIENT_ID```  
-- ```AUTH_GOOGLE_HOSTED_DOMAIN```  
-- ```AUTH_GOOGLE_CALLBACK_URL``` - usually https://tweekdomain/auth/google/callback  
- azuread
-- ```AUTH_AZUREAD_CLIENT_SECRET```  
-- ```AUTH_AZUREAD_CLIENT_ID```  
-- ```AUTH_AZUREAD_CALLBACK_URL``` - usually https://tweekdomain/auth/azure/callback  
- httpdigest  
-- ```AUTH_DIGEST_USER```  
-- ```AUTH_DIGEST_PASSWORD```
- oauth2  
-- ```AUTH_OAUTH2_AUTHORIZATION_URL```  
-- ```AUTH_OAUTH2_TOKEN_URL```  
-- ```AUTH_OAUTH2_CLIENT_ID```  
-- ```AUTH_OAUTH2_CLIENT_SECRET```  
-- ```AUTH_OAUTH2_CALLBACK_URL```  - usually https://tweekdomain/auth/oauth2/callback

For example:
```
- TWEEK_AUTH_SCHEMES=azuread,google 
- AUTH_GOOGLE_CLIENT_ID=****************
- AUTH_GOOGLE_CLIENT_SECRET=*******************
- AUTH_GOOGLE_CALLBACK_URL=https://*********/auth/google/callback 
- AUTH_GOOGLE_HOSTED_DOMAIN=mydomain.com
- AUTH_AZUREAD_CLIENT_ID=***************
- AUTH_AZUREAD_CLIENT_SECRET=*************
- AUTH_AZUREAD_CALLBACK_URL=https://********/auth/openid/callback 
```

So, in this setup, our users can choose either azure active directory login, or google login.