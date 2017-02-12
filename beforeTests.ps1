echo "Before tests"

Start-Job -Name RunLocalDeployment -ArgumentList (Resolve-Path "Tweek.ApiService.NetCore").Path -ScriptBlock { 
    Param($webservicePath)
        Start-Process -FilePath "C:\Program Files\dotnet\dotnet.exe" -ArgumentList "run" -WorkingDirectory $webservicePath
}

Wait-Job -Name RunLocalDeployment -Timeout 5

Start-Sleep -s 10

$Env:TWEEK_SMOKE_TARGET = "http://localhost:5000"

exit $LastExitCode
