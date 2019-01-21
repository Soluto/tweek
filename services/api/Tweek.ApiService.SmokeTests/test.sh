#!/bin/bash

# Abort script on error
set -e

wget -O /dev/null  --tries=20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://gateway/status
sleep 3
dotnet test --no-build
