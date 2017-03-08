echo running image;
docker run --rm -d -p 5000:80 --name tweek-latest soluto/tweek-api:candidate;
curl --retry-delay 5 --retry 20 -v http://localhost:5000/status
echo running smoke tests;
dotnet test Tweek.ApiService.SmokeTests/Tweek.ApiService.SmokeTests.csproj;
docker kill tweek-latest;