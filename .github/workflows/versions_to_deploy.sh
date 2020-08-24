git tag | cat
echo checking api version
TWEEK_API_VERSION=$(cat ../../services/api/Tweek.ApiService/Tweek.ApiService.csproj | grep -E "VersionPrefix" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
TWEEK_API_TAG="tweek-api-$TWEEK_API_VERSION"

echo "::set-env name=TWEEK_DOCKER_TAG_API::latest"
if [[ "$(git tag | grep -c $TWEEK_API_TAG)" == "0" ]]; then
    echo tagging $TWEEK_API_TAG
    echo "::set-env name=TWEEK_DOCKER_TAG_API::$TWEEK_API_VERSION"
fi

echo checking publishing version
TWEEK_PUBLISHING_VERSION=$(cat ../../services/publishing/Tweek.Publishing.Service/Tweek.Publishing.Service.csproj | grep -E "VersionPrefix" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
TWEEK_PUBLISHING_TAG="tweek-publishing-$TWEEK_PUBLISHING_VERSION"
echo "::set-env name=TWEEK_DOCKER_TAG_PUBLISHING::latest"
if [[ "$(git tag | grep -c $TWEEK_PUBLISHING_TAG)" == "0" ]]; then
    echo tagging $TWEEK_PUBLISHING_TAG
    echo "::set-env name=TWEEK_DOCKER_TAG_PUBLISHING::$TWEEK_PUBLISHING_VERSION"
fi

echo checking authoring version
TWEEK_AUTHORING_VERSION=$(cat ../../services/authoring/package.json | grep -E "\"version\"" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
TWEEK_AUTHORING_TAG="tweek-authoring-$TWEEK_AUTHORING_VERSION"
echo "::set-env name=TWEEK_DOCKER_TAG_AUTHORING::latest"
if [[ "$(git tag | grep -c $TWEEK_AUTHORING_TAG)" == "0" ]]; then
    echo tagging $TWEEK_AUTHORING_TAG
    echo "::set-env name=TWEEK_DOCKER_TAG_AUTHORING::$TWEEK_AUTHORING_VERSION"
fi

echo checking editor version
TWEEK_EDITOR_VERSION=$(cat ../../services/editor/package.json | grep -E "\"version\"" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
TWEEK_EDITOR_TAG="tweek-editor-$TWEEK_EDITOR_VERSION"
echo "::set-env name=TWEEK_DOCKER_TAG_EDITOR::latest"
if [[ "$(git tag | grep -c $TWEEK_EDITOR_TAG)" == "0" ]]; then
    echo tagging $TWEEK_EDITOR_TAG
    echo "::set-env name=TWEEK_DOCKER_TAG_EDITOR::$TWEEK_EDITOR_VERSION"
fi

echo checking gateway version
TWEEK_GATEWAY_VERSION=$(cat ../../services/gateway/version.go | grep -E "Version" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
TWEEK_GATEWAY_TAG="tweek-gateway-$TWEEK_GATEWAY_VERSION"
echo "::set-env name=TWEEK_DOCKER_TAG_GATEWAY::latest"
if [[ "$(git tag | grep -c $TWEEK_GATEWAY_TAG)" == "0" ]]; then
    echo tagging $TWEEK_GATEWAY_TAG
    echo "::set-env name=TWEEK_DOCKER_TAG_GATEWAY::$TWEEK_GATEWAY_VERSION"
fi
