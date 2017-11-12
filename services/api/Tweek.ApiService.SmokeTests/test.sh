#!/bin/bash

# Abort script on error
set -e
wget --tries 20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://api/status

ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
/wait-for-it.sh $ZAP_URL -t 120

curl --fail $PROXY_URL/JSON/core/action/newSession/?name=smoke-tests\&overwrite=true
curl --fail $PROXY_URL/JSON/pscan/action/enableAllScanners
curl --fail $PROXY_URL/JSON/core/action/clearExcludedFromProxy

# Disable X-Content-Type and Cache control scanners - not relevant for this API
curl --fail $PROXY_URL/JSON/pscan/action/disableScanners/?ids=10021,10049

echo PROXY_URL $PROXY_URL
dotnet test
