#!/bin/bash

# Abort script on error

wget -O /dev/null  --tries=20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://gateway/status
set -e
sleep 10
wget -O /dev/null  --tries=20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://api/health
dotnet test --no-build
