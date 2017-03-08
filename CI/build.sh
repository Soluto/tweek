echo "restoring packages"
dotnet restore Tweek.sln;
echo "building"
dotnet build Tweek.sln -c Release;
