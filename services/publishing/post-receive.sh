#!/bin/bash

source ~/.env
cd $(dirname $(dirname $0))
echo "Pushing to upstream repo $GIT_UPSTREAM_URI using $GIT_SSH from `pwd`" >> /tweek/repo.log
echo git push $GIT_UPSTREAM_URI >> /tweek/repo.log
git push $GIT_UPSTREAM_URI >> /tweek/repo.log 2>&1
echo "finished push" >> /tweek/repo.log