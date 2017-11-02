#!/bin/bash

# Abort script on error
set -e

./wait-for-it.sh api:80 -t 4000
./wait-for-it.sh zap-e2e:8090 -t 4000

yarn test -- --host selenium --port 4444 --proxy http://zap-e2e:8090

# todo: get alerts from Zap