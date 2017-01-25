# Start Local Service for Smoke Tests

echo "Before tests"

Start-Job -Name RunLocalDeployment -ArgumentList (Resolve-Path "Tweek.ApiService.NetCore").Path -ScriptBlock { 
    Param($webservicePath)
        Start-Process -FilePath "$($webservicePath)/publish/Tweek.ApiService.NetCore.exe" -WorkingDirectory $webservicePath
}

Wait-Job -Name RunLocalDeployment -Timeout 5

$Env:TWEEK_SMOKE_TARGET = "http://localhost:5000"

exit $LastExitCode
