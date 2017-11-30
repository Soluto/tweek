#!/bin/bash

# Abort script on error
set -e

function run_tests()
{
  wget --tries 20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://api/health
  dotnet test --no-build
}

if [ -z "$PROXY_URL" ]
then
  echo "PROXY_URL is not set, not running security checks"
  run_tests
else
  ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
  /wait-for-it.sh $ZAP_URL -t 120

  trap "curl $PROXY_URL/JSON/core/action/newSession 2> /dev/null" EXIT

  curl --fail $PROXY_URL/JSON/core/action/newSession/?name=smoke%2Ftests\&overwrite=true 2> /dev/null
  curl --fail $PROXY_URL/JSON/pscan/action/enableAllScanners 2> /dev/null
  curl --fail $PROXY_URL/JSON/core/action/clearExcludedFromProxy 2> /dev/null

  # Disable X-Content-Type and Cache control scanners - not relevant for this API
  curl --fail $PROXY_URL/JSON/pscan/action/disableScanners/?ids=10021,10049 2> /dev/null

  run_tests

  echo "waiting for zap to finish scanning"
  while [ "$(curl --fail $PROXY_URL/JSON/pscan/view/recordsToScan 2> /dev/null | jq '.recordsToScan')" != '"0"' ]; do sleep 1; done
fi
