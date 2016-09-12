$xunitConsoleRunner = "$env:APPVEYOR_BUILD_FOLDER\\packages\\xunit.runner.console.2.1.0\\tools\\xunit.console.exe"

# Start Local Service for Smoke Tests
Start-Job -Name RunLocalDeployment -ScriptBlock { 
    & 'C:\\Program Files (x86)\\IIS Express\\iisexpress.exe' /port:1234 /path:"$env:APPVEYOR_BUILD_FOLDER\\Tweek.ApiService"
}

Wait-Job -Name RunLocalDeployment -Timeout 5

$Env:TWEEK_SMOKE_TARGET = "http://localhost:1234"

# Run Smoke Tests
$testAssemblies = @(
    "$env:APPVEYOR_BUILD_FOLDER\\Engine.Tests\\bin\\Release\\Engine.IntegrationTests.dll",
    "$env:APPVEYOR_BUILD_FOLDER\\Engine.Core.Tests\\bin\\Release\\Engine.Core.Tests.dll",
    "$env:APPVEYOR_BUILD_FOLDER\\Tweek.ApiService.SmokeTests\\bin\\Release\\Tweek.ApiService.SmokeTests.dll",
    "$env:APPVEYOR_BUILD_FOLDER\\JPad\\Tweek.JPad.Tests\\bin\\Release\\Tweek.JPad.Tests.dll"
    )

& $xunitConsoleRunner $testAssemblies

$resultsCode = $LastExitCode

# Stop Local Service
Receive-Job -Name RunLocalDeployment | Write-Host
Stop-Job -Name RunLocalDeployment 
Remove-Job -Name RunLocalDeployment

exit $resultsCode