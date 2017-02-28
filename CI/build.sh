set -e
dotnet restore tweek.sln
dotnet build -c Release --version-sufix $BUILD_NUMBER