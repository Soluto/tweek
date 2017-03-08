set -e
apt-get update && apt-get install jq
docker login -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD