set -e
dotnet publish ./Tweek.ApiService.NetCore/Tweek.ApiService.NetCore.csproj  -c Release -o ./obj/Docker/publish
docker build -t soluto/tweek-api:candidate ./Tweek.ApiService.NetCore