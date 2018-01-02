#!/bin/bash

source ~/.bashrc
cd /tweek/repo
result=$( git fetch $GIT_UPSTREAM_URI '+refs/heads/*:refs/heads/*' 2>&1 )
code=$?
echo $result
exit $code