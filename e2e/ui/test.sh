#!/bin/bash

# Abort script on error
set -e

function run_tests()
{
  yarn test --host selenium --port 4444 $@
}

if [ -z "$PROXY_URL" ]
then
  echo PROXY_URL is not set, not running security checks
  run_tests
else
  ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
  /wait-for-it.sh $ZAP_URL -t 120

  trap "curl $PROXY_URL/JSON/core/action/newSession 2> /dev/null" EXIT

  curl --fail $PROXY_URL/JSON/core/action/newSession/?name=e2e%2Ftests\&overwrite=true 2> /dev/null
  curl --fail $PROXY_URL/JSON/pscan/action/enableAllScanners 2> /dev/null
  curl --fail $PROXY_URL/JSON/core/action/clearExcludedFromProxy 2> /dev/null

  # 10096 - Disable Timestamp scanner because of bug - see PR https://github.com/zaproxy/zap-extensions/pull/1121
  # 10049 - Disable Cache control scanner - not relevant for this API
  # 10038 - Temporary disable CSP rule - until we decided to add CSP to the editor
  # 10094 - Temporary disable base64 disclosure - base64 is heavily used in Tweek
  # 10097 - Temporary disable weak hash (SHA-1) - SHA-1 is heavily used in Tweek
  curl --fail $PROXY_URL/JSON/pscan/action/disableScanners/?ids=10096,10049,10038,10094,10097 2> /dev/null

  # Ignore all static urls - no need to scan them.
  curl --fail $PROXY_URL/JSON/core/action/excludeFromProxy/?regex=.*%3Fstatic.*%3F 2> /dev/null

  run_tests --proxy $PROXY_URL

  echo "waiting for zap to finish scanning"
  while [ "$(curl --fail $PROXY_URL/JSON/pscan/view/recordsToScan 2> /dev/null | jq '.recordsToScan')" != '"0"' ]; do sleep 1; done
fi
