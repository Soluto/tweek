#!/bin/bash

# Abort script on error
set -e

wget -O /dev/null --tries 20 --timeout=15 --read-timeout=20 --waitretry=30 --retry-connrefused http://api/status
dotnet test --no-build
