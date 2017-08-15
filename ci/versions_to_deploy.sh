echo checking api version
TWEEK_API_VERSION=$(cat ./services/api/Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj | grep -E "VersionPrefix" | grep -Eo [0-9.]*)
TWEEK_API_SHOULD_UPDATE=$([[ "$(git tag | grep -c tweek-api-0.1.32)" == "0" ]] && echo "true" || echo "false")
echo checking management version
TWEEK_MANAGEMENT_VERSION=$(cat ./services/management/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_MANAGEMENT_SHOULD_UPDATE=$([[ "$(git tag | grep -c tweek-management-$TWEEK_MANAGEMENT_VERSION)" == "0" ]] && echo "true" || echo "false")
echo checking authoring version
TWEEK_AUTHORING_VERSION=$(cat ./services/authoring/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_AUTHORING_SHOULD_UPDATE=$([[ "$(git tag | grep -c tweek-authoring-$TWEEK_AUTHORING_VERSION)" == "0" ]] && echo "true" || echo "false")
echo  checking editor version
TWEEK_EDITOR_VERSION=$(cat ./services/editor/package.json | grep -E "\"version\"" | grep -Eo [0-9.]*)
TWEEK_EDITOR_SHOULD_UPDATE=$([[ "$(git tag | grep -c tweek-editor-$TWEEK_EDITOR_VERSION)" == "0" ]] && echo "true" || echo "false")

echo $(set | grep TWEEK)

set | grep TWEEK >> $1