# Stop Local Service
Receive-Job -Name RunLocalDeployment | Write-Host
Stop-Job -Name RunLocalDeployment 
Remove-Job -Name RunLocalDeployment

exit $LastExitCode