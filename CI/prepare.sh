set -e
apt-get update && apt-get install jq
echo docker login
docker login -u=$DOCKER_USERNAME -p=$DOCKER_PASSWORD