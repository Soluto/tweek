set -e
echo restoring packages
dotnet restore Tweek.sln;
echo building
dotnet build Tweek.sln -c Release --version-suffix "$VERSION_SUFFIX";
echo running tests
find . -wholename '*.Tests.csproj' -print0 | xargs -0 -n 1 dotnet test
dotnet publish ./services/api/Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj  -c Release -o ./obj/Docker/publish --version-suffix "$VERSION_SUFFIX"
