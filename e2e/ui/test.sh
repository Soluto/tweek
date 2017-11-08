#!/bin/bash

# Abort script on error
set -e

./wait-for-it.sh api:80 -t 4000
./wait-for-it.sh zap-e2e:8090 -t 4000

# Disable Timestamp scanner because of bug - see PR https://github.com/zaproxy/zap-extensions/pull/1121
curl --fail http://zap-e2e:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10096 > /dev/null

# Disable Cache control scanner - not relevant for this API
curl --fail http://zap-e2e:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10049 > /dev/null

# Temporary disable CSP rule - until we decided to add CSP to the editor
curl --fail http://zap-e2e:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10038 > /dev/null

# Temporary disable base64 disclosure - base64 is heavily used in Tweek
curl --fail http://zap-e2e:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10094 > /dev/null

# Temporary disable weak hash (SHA-1) - SHA-1 is heavily used in Tweek
curl --fail http://zap-e2e:8090/JSON/pscan/action/disableScanners/?zapapiformat=JSON\&formMethod=GET\&ids=10097 > /dev/null

# Ignore all static urls - no need to scan them.
curl --fail http://zap-e2e:8090/JSON/core/action/excludeFromProxy/?zapapiformat=JSON\&formMethod=GET\&regex=.*%3Fstatic.*%3F > /dev/null

yarn test -- --host selenium --port 4444 --proxy http://zap-e2e:8090

mkdir /usr/src/wrk/
cp glue_editor.json /usr/src/wrk/

ruby /usr/bin/glue/bin/glue \
   -t zap \
   --zap-host http://zap-e2e --zap-port 8090 --zap-passive-mode \
   -f text \
   --exit-on-warn 0 \
   http://editor \
   --finding-file-path /usr/src/wrk/glue_editor.json