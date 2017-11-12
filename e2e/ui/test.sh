#!/bin/bash

# Abort script on error
set -e

ZAP_URL=$(echo $PROXY_URL | sed -e 's/https\?:\/\///')
./wait-for-it.sh $ZAP_URL -t 120

curl --fail $PROXY_URL/JSON/core/action/newSession/?name=e2e-tests\&overwrite=true
curl --fail $PROXY_URL/JSON/pscan/action/enableAllScanners
curl --fail $PROXY_URL/JSON/core/action/clearExcludedFromProxy

# 10096 - Disable Timestamp scanner because of bug - see PR https://github.com/zaproxy/zap-extensions/pull/1121
# 10049 - Disable Cache control scanner - not relevant for this API
# 10038 - Temporary disable CSP rule - until we decided to add CSP to the editor
# 10094 - Temporary disable base64 disclosure - base64 is heavily used in Tweek
# 10097 - Temporary disable weak hash (SHA-1) - SHA-1 is heavily used in Tweek
curl --fail $PROXY_URL/JSON/pscan/action/disableScanners/?ids=10096,10049,10038,10094,10097

# Ignore all static urls - no need to scan them.
curl --fail $PROXY_URL/JSON/core/action/excludeFromProxy/?regex=.*%3Fstatic.*%3F

yarn test --host selenium --port 4444 --proxy $PROXY_URL
