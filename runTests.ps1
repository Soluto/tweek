$xunitConsoleRunner = ".\\packages\\xunit.runner.console.2.1.0\\tools\\xunit.console.exe"

# Start Local Service for Smoke Tests
Start-Job -Name RunLocalDeployment -ArgumentList (Resolve-Path "Tweek.ApiService").Path -ScriptBlock { 
    Param($webservicePath)
        & 'C:\\Program Files (x86)\\IIS Express\\iisexpress.exe' /port:1234 /path:"$webservicePath" /trace:warning
}

Wait-Job -Name RunLocalDeployment -Timeout 5

$Env:TWEEK_SMOKE_TARGET = "http://localhost:1234"

# Run Smoke Tests
$testAssemblies = @(
    ".\\Engine.Tests\\bin\\Release\\Engine.IntegrationTests.dll",
    ".\\Engine.Core.Tests\\bin\\Release\\Engine.Core.Tests.dll",
    ".\\Tweek.ApiService.SmokeTests\\bin\\Release\\Tweek.ApiService.SmokeTests.dll",
    ".\\JPad\\Tweek.JPad.Tests\\bin\\Release\\Tweek.JPad.Tests.dll"
    )

& $xunitConsoleRunner $testAssemblies

$resultsCode = $LastExitCode

# Stop Local Service
Receive-Job -Name RunLocalDeployment | Write-Host
Stop-Job -Name RunLocalDeployment 
Remove-Job -Name RunLocalDeployment

exit $resultsCode