echo checking api version
TWEEK_API_VERSION=$(cat ../../services/api/Tweek.ApiService/Tweek.ApiService.csproj | grep -E "VersionPrefix" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
if [[ "$(git tag | grep -c tweek-api-$TWEEK_API_VERSION)" == "0" ]]; then
    echo tagging $TWEEK_API_VERSION
    echo "::set-env name=TWEEK_API_VERSION::$TWEEK_API_VERSION"
fi

echo checking publishing version
TWEEK_PUBLISHING_VERSION=$(cat ../../services/publishing/Tweek.Publishing.Service/Tweek.Publishing.Service.csproj | grep -E "VersionPrefix" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
if [[ "$(git tag | grep -c tweek-publishing-$TWEEK_PUBLISHING_VERSION)" == "0" ]]; then
    echo tagging $TWEEK_PUBLISHING_VERSION
    echo "::set-env name=TWEEK_PUBLISHING_VERSION::$TWEEK_PUBLISHING_VERSION"
fi

echo checking authoring version
TWEEK_AUTHORING_VERSION=$(cat ../../services/authoring/package.json | grep -E "\"version\"" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
if [[ "$(git tag | grep -c tweek-authoring-$TWEEK_AUTHORING_VERSION)" == "0" ]]; then
    echo tagging $TWEEK_AUTHORING_VERSION
    echo "::set-env name=TWEEK_AUTHORING_VERSION::$TWEEK_AUTHORING_VERSION"
fi

echo checking editor version
TWEEK_EDITOR_VERSION=$(cat ../../services/editor/package.json | grep -E "\"version\"" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
if [[ "$(git tag | grep -c tweek-editor-$TWEEK_EDITOR_VERSION)" == "0" ]]; then
    echo tagging $TWEEK_EDITOR_VERSION
    echo "::set-env name=TWEEK_EDITOR_VERSION::$TWEEK_EDITOR_VERSION"
fi

echo checking gateway version
TWEEK_GATEWAY_VERSION=$(cat ../../services/gateway/version.go | grep -E "Version" | grep -Eo "[0-9.]*(-rc[0-9]*)?")
if [[ "$(git tag | grep -c tweek-gateway-$TWEEK_GATEWAY_VERSION)" == "0" ]]; then
    echo tagging $TWEEK_GATEWAY_VERSION
    echo "::set-env name=TWEEK_GATEWAY_VERSION::$TWEEK_GATEWAY_VERSION"
fi
