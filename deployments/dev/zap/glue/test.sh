#!/bin/bash

# Abort script on error
set -e
PROXY_URL="$ZAP_HOST:$ZAP_PORT"
ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
/wait-for-it.sh $ZAP_URL -t 120

curl --fail $PROXY_URL/JSON/core/action/loadSession/?name=smoke-tests

ruby /glue/bin/glue -t zap \
  --zap-host $ZAP_HOST --zap-port $ZAP_PORT --zap-passive-mode \
  -f text \
  --exit-on-warn 0 \
  http://api \
  --finding-file-path ./glue_api.json

curl --fail $PROXY_URL/JSON/core/action/loadSession/?name=e2e-tests

ruby /glue/bin/glue \
   -t zap \
   --zap-host $ZAP_HOST --zap-port $ZAP_PORT --zap-passive-mode \
   -f text \
   --exit-on-warn 0 \
   http://editor \
   --finding-file-path ./glue_editor.json
