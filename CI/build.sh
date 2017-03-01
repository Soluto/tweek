set -e
dotnet restore tweek.sln
dotnet build -c Release
