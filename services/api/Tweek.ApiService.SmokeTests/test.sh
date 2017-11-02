#!/bin/bash

# Abort script on error
set -e

./wait-for-it.sh api:80 -t 4000
./wait-for-it.sh zap:8090 -t 4000

dotnet test

#todo: get alerts from Zap