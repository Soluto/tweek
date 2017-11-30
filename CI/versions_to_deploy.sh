echo checking api version
TWEEK_API_VERSION=$(cat ./services/api/Tweek.ApiService/Tweek.ApiService.csproj | grep -E "VersionPrefix" | grep -Eo [0-9.]*)
TWEEK_API_TAG="tweek-api-$TWEEK_API_VERSION"
export TWEEK_DOCKER_TAG_API="latest"
if [[ "$(git tag | grep -c $TWEEK_API_TAG)" == "0" ]]; then
    echo tagging $TWEEK_API_TAG
    export TWEEK_DOCKER_TAG_API=$TWEEK_API_VERSION
fi

echo checking management version
TWEEK_MANAGEMENT_VERSION=$(cat ./services/management/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_MANAGEMENT_TAG="tweek-management-$TWEEK_MANAGEMENT_VERSION"
export TWEEK_DOCKER_TAG_MANAGEMENT="latest"
if [[ "$(git tag | grep -c $TWEEK_MANAGEMENT_TAG)" == "0" ]]; then
    echo tagging $TWEEK_MANAGEMENT_TAG
    export TWEEK_DOCKER_TAG_MANAGEMENT=$TWEEK_MANAGEMENT_VERSION
fi

echo checking authoring version
TWEEK_AUTHORING_VERSION=$(cat ./services/authoring/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_AUTHORING_TAG="tweek-authoring-$TWEEK_AUTHORING_VERSION"
export TWEEK_DOCKER_TAG_AUTHORING="latest"
if [[ "$(git tag | grep -c $TWEEK_AUTHORING_TAG)" == "0" ]]; then
    echo tagging $TWEEK_AUTHORING_TAG
    export TWEEK_DOCKER_TAG_AUTHORING=$TWEEK_AUTHORING_VERSION
fi

echo  checking editor version
TWEEK_EDITOR_VERSION=$(cat ./services/editor/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_EDITOR_TAG="tweek-editor-$TWEEK_EDITOR_VERSION"
export TWEEK_DOCKER_TAG_EDITOR="latest"
if [[ "$(git tag | grep -c $TWEEK_EDITOR_TAG)" == "0" ]]; then
    echo tagging $TWEEK_EDITOR_TAG
    export TWEEK_DOCKER_TAG_EDITOR=$TWEEK_EDITOR_VERSION
fi

env | grep TWEEK_DOCKER_TAG > $1
