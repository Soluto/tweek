#!/bin/bash

set -e

sleep 10
curl --retry 3 --retry-max-time 10 -v http://couchbase:8091/settings/web -d port=8091 -d username=Administrator -d password=password
curl --retry 3 --retry-max-time 10 -v -u Administrator:password -X POST http://couchbase:8091/pools/default/buckets -d authType=sasl -d name=testbucket -d ramQuotaMB=100 -d saslPassword=password
