echo "restoring packages"
dotnet restore tweek.sln
echo "building"
dotnet build -c Release
