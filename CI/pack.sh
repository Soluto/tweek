set -e
dotnet publish ./Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj  -c Release -o ./obj/Docker/publish --version-suffix "ci-$BUILD_NUMBER"
docker build -t soluto/tweek-api:candidate ./Tweek.ApiService.NetCore