#!/usr/bin/env bash

NAME=$1
VERSION=$2
SOURCE_URL=$3

# if [[ "$VERSION" == "latest" ]]
# then
#   echo "No need to update swagger"
#   exit 0
# fi

echo "Updating swagger for $VERSION version"

DESTINATION_URL="https://tweek-swagger-updater.azurewebsites.net/api/UpdateSwagger?code=$UPDATE_SWAGGER_SECRET&name=$NAME&version=$VERSION"

SWAGGER=$(curl $SOURCE_URL 2>/dev/null)
if [[ $? != 0 ]]
then
  echo "Fetching swagger failed!"
  exit 1
fi

curl -f --data "$SWAGGER" "$DESTINATION_URL"
if [[ $? != 0 ]]
then
  echo "Updating swagger failed!"
  exit 1
fi

echo "Successfully updated swagger!"
