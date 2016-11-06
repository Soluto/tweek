# Start Local Service for Smoke Tests

echo "Before tests"

Start-Job -Name RunLocalDeployment -ArgumentList (Resolve-Path "Tweek.ApiService").Path -ScriptBlock { 
    Param($webservicePath)
        & 'C:\\Program Files (x86)\\IIS Express\\iisexpress.exe' /port:1234 /path:"$webservicePath" /trace:warning
}

Wait-Job -Name RunLocalDeployment -Timeout 5

$Env:TWEEK_SMOKE_TARGET = "http://localhost:1234"

exit $LastExitCode