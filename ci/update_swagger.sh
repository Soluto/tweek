#!/usr/bin/env bash

SOURCE_URL=$1
DESTINATION_URL=$2

SWAGGER=$(curl $SOURCE_URL 2>/dev/null)
if [[ $? != 0 ]]
then
  echo "Fetching swagger failed!"
  exit 1
fi

curl --data "$SWAGGER" $DESTINATION_URL
if [[ $? != 0 ]]
then
  echo "Updating swagger failed!"
  exit 1
fi

echo "Successfully updated swagger!"
