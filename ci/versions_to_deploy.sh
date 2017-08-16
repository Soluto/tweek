echo checking api version
TWEEK_API_VERSION=$(cat ./services/api/Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj | grep -E "VersionPrefix" | grep -Eo [0-9.]*)
TWEEK_API_TAG="tweek-api-$TWEEK_API_VERSION"
TWEEK_API_DOCKER_TAG="latest-exp"
if [[ "$(git tag | grep -c $TWEEK_API_TAG)" == "0" ]]; then
    TWEEK_API_DOCKER_TAG=$TWEEK_API_VERSION-exp
fi
echo $TWEEK_API_DOCKER_TAG

TWEEK_API_SHOULD_UPDATE=$([[ "$(git tag | grep -c $TWEEK_API_TAG)" == "0" ]] && echo "true" || echo "false")
if [ "$TWEEK_API_SHOULD_UPDATE" == 'true' ]; then
    echo 'tagging $TWEEK_API_TAG'
    git tag $TWEEK_API_TAG-exp
fi

echo checking management version
TWEEK_MANAGEMENT_VERSION=$(cat ./services/management/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_MANAGEMENT_TAG="tweek-management-$TWEEK_MANAGEMENT_VERSION"
TWEEK_MANAGEMENT_SHOULD_UPDATE=$([[ "$(git tag | grep -c $TWEEK_MANAGEMENT_TAG)" == "0" ]] && echo "true" || echo "false")
if [ "$TWEEK_MANAGEMENT_SHOULD_UPDATE" == 'true' ]; then
    echo 'tagging $TWEEK_MANAGEMENT_TAG'
    git tag $TWEEK_MANAGEMENT_TAG-exp
fi

echo checking authoring version
TWEEK_AUTHORING_VERSION=$(cat ./services/authoring/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_AUTHORING_TAG="tweek-authoring-$TWEEK_MANAGEMENT_VERSION"
TWEEK_AUTHORING_SHOULD_UPDATE=$([[ "$(git tag | grep -c $TWEEK_AUTHORING_TAG)" == "0" ]] && echo "true" || echo "false")
if [ "$TWEEK_AUTHORING_SHOULD_UPDATE" == 'true' ]; then
    echo 'tagging $TWEEK_AUTHORING_TAG'
    git tag $TWEEK_AUTHORING_TAG-exp
fi

echo  checking editor version
TWEEK_EDITOR_VERSION=$(cat ./services/editor/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_EDITOR_TAG="tweek-editor-$TWEEK_EDITOR_VERSION"
TWEEK_EDITOR_SHOULD_UPDATE=$([[ "$(git tag | grep -c $TWEEK_EDITOR_TAG)" == "0" ]] && echo "true" || echo "false")
if [ "$TWEEK_EDITOR_SHOULD_UPDATE" == 'true' ]; then
    echo 'tagging $TWEEK_EDITOR_TAG'
    git tag $TWEEK_EDITOR_TAG-exp
fi

echo $(set | grep TWEEK)

set | grep TWEEK >> $1