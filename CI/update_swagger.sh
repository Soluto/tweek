#!/usr/bin/env bash

NAME=$1
VERSION=$2
SWAGGER_FILE=$3

if [[ "$VERSION" == "latest" ]]
then
  echo "No need to update swagger"
  exit 0
fi

echo "Updating swagger for $NAME:$VERSION"

DESTINATION_URL="https://tweek-swagger-updater.azurewebsites.net/api/UpdateSwagger?code=$UPDATE_SWAGGER_SECRET&name=$NAME&version=$VERSION"
SWAGGER=$(<$SWAGGER_FILE)

curl -f --data "$SWAGGER" "$DESTINATION_URL"
if [[ $? != 0 ]]
then
  echo "Updating swagger failed!"
  exit 1
fi

echo "Successfully updated swagger!"
