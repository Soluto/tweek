#!/bin/bash

# Abort script on error
set -e

./wait-for-it.sh api:80 -t 4000
./wait-for-it.sh zap:8090 -t 4000

# Disable X-Content-Type scanner - not relevant for API
curl --fail http://zap:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10021

#Disable Cache control scanner - not relevant for this API
curl --fail http://zap:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10049

dotnet test

mkdir /usr/src/wrk/
cp glue.json /usr/src/wrk/

ruby /usr/bin/glue/bin/glue \
  -t zap \
  --zap-host http://zap --zap-port 8090 --zap-passive-mode \
  -f text \
  --exit-on-warn 0 \
  http://api \
  --finding-file-path /usr/src/wrk/glue.json \
