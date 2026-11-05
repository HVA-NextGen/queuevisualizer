param(
    [string]$Subscription = 'aa8e5073-bda3-45ad-a772-7c5989954f8e',
    [string]$ResourceGroup = 'rg-queuevisualizer',
    [string]$Location = 'swedencentral',
    [string]$Plan = 'asp-queuevisualizer-dev-swedencentral-001',
    [string]$App = 'app-queuevisualizer-dev-swedencentral-001',
    [switch]$CodeOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Azure {
    & az @args
    if ($LASTEXITCODE -ne 0) { throw "Azure CLI failed: az $($args -join ' ')" }
}

Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    if (-not $CodeOnly) {
        Invoke-Azure group show --subscription $Subscription --name $ResourceGroup --output none

        $existingPlan = Invoke-Azure appservice plan list --subscription $Subscription --resource-group $ResourceGroup --output json |
            ConvertFrom-Json | Where-Object name -eq $Plan
        if ($existingPlan) {
            if ($existingPlan.sku.name -ne 'F1' -or $existingPlan.kind -notmatch 'linux') {
                throw 'The target plan exists but is not Linux F1. Refusing to modify it.'
            }
        }

        $existingApp = Invoke-Azure webapp list --subscription $Subscription --resource-group $ResourceGroup --output json |
            ConvertFrom-Json | Where-Object name -eq $App
        if ($existingApp) {
            $appPlan = Invoke-Azure resource show --subscription $Subscription --ids $existingApp.id --query properties.serverFarmId --output tsv
            if (($appPlan -split '/')[-1] -ne $Plan) {
                throw 'The target Web App belongs to a different plan. Refusing to move it.'
            }
        }

        Invoke-Azure deployment group create --subscription $Subscription --resource-group $ResourceGroup --name queuevisualizer --template-file infra/main.bicep --parameters location=$Location planName=$Plan appName=$App --output none
    }

    $artifactDirectory = Join-Path (Get-Location) '.azure\artifacts'
    New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
    $archive = Join-Path $artifactDirectory 'queuevisualizer-source.zip'
    if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive }
    Compress-Archive -Path src,index.html,package.json,package-lock.json,server.mjs,telemetry.mjs,tsconfig.json,tsconfig.app.json,tsconfig.node.json,vite.config.ts -DestinationPath $archive

    Invoke-Azure webapp deploy --subscription $Subscription --resource-group $ResourceGroup --name $App --src-path $archive --type zip --clean true --restart true --timeout 1200000 --query properties.status --output tsv
    $hostname = Invoke-Azure webapp show --subscription $Subscription --resource-group $ResourceGroup --name $App --query defaultHostName --output tsv
    Write-Output "Website: https://$hostname"
} finally {
    Pop-Location
}
