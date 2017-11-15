#!/bin/bash

# Abort script on error
set -e
export PROXY_URL="$ZAP_HOST:$ZAP_PORT"
ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
/wait-for-it.sh $ZAP_URL -t 120

./run_glue.sh http://api smoke%2Ftests ./glue_api.json 

./run_glue.sh http://editor e2e%2Ftests ./glue_editor.json
