#!/bin/bash

set -e

echo getting version number
export TWEEK_VERSION=$(curl http://localhost:5000/status | jq '.EnvironmentDetails .Version' | grep -Po [0-9]+.[0-9]+.[0-9]+)
echo $TWEEK_VERSION
docker kill tweek-latest

function docker_tag_exists() {
    TOKEN=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${DOCKER_USERNAME}'", "password": "'${DOCKER_PASSWORD}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)
    EXISTS=$(curl -s -H "Authorization: JWT ${TOKEN}" https://hub.docker.com/v2/repositories/$1/tags/?page_size=10000 | jq -r "[.results | .[] | .name == \"$2\"]" | grep -c true)
    test $EXISTS = 1
}

if docker_tag_exists soluto/tweek-api $TWEEK_VERSION; then
	echo no tagged release
else 
	echo new tagged release
	docker tag soluto/tweek-api:candidate soluto/tweek-api:$TWEEK_VERSION
	# docker push soluto/tweek-api:$TWEEK_VERSION
fi

docker tag soluto/tweek-api:candidate soluto/tweek-api:latest
# docker push soluto/tweek-api:latest