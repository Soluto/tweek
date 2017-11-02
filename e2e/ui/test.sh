#!/bin/bash

# Abort script on error
set -e

./wait-for-it.sh api:80 -t 4000
./wait-for-it.sh zap-e2e:8090 -t 4000

yarn test -- --host selenium --port 4444 --proxy http://zap-e2e:8090

ruby /usr/bin/glue/bin/glue \
   -t zap \
   --zap-host http://zap-e2e --zap-port 8090 --zap-passive-mode \
   -f text \
   --exit-on-warn 0 \
   http://editor \
   --finding-file-path /usr/src/wrk/glue_editor.json