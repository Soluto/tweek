#!/bin/bash

# Abort script on error
set -e

# prepare
echo 'building images'
docker-compose build &
docker-compose -f docker-compose.zap.yml build &
docker-compose down --remove-orphans &
wait 

# run tests
echo 'running tests'
docker-compose up smoke-tests e2e-ui e2e-integration

# run security test
echo 'running security tests'
docker-compose -f docker-compose.zap.yml run --rm glue
