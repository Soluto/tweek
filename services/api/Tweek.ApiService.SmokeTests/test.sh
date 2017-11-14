#!/bin/bash

# Abort script on error
set -e
wget --tries 20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://api/status

if [ -z "$PROXY_URL" ]
then 
  echo PROXY_URL is not set, not running security checks
else
  ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
  /wait-for-it.sh $ZAP_URL -t 120

  trap "curl $PROXY_URL/JSON/core/action/newSession" EXIT

  curl --fail $PROXY_URL/JSON/core/action/newSession/?name=smoke%2Ftests\&overwrite=true
  curl --fail $PROXY_URL/JSON/pscan/action/enableAllScanners
  curl --fail $PROXY_URL/JSON/core/action/clearExcludedFromProxy

  # Disable X-Content-Type and Cache control scanners - not relevant for this API
  curl --fail $PROXY_URL/JSON/pscan/action/disableScanners/?ids=10021,10049
fi

dotnet test
