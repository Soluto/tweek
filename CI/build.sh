set -e
echo restoring packages
dotnet restore Tweek.sln;
echo building
dotnet build Tweek.sln -c Release --version-suffix "ci-$BUILD_NUMBER";
