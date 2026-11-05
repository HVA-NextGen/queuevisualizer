targetScope = 'resourceGroup'

@description('Azure region for the free demo hosting.')
param location string = resourceGroup().location

@description('Name of the free Linux App Service plan.')
@minLength(1)
@maxLength(60)
param planName string = 'asp-queuevisualizer-dev-swedencentral-001'

@description('Globally unique Web App name.')
@minLength(2)
@maxLength(60)
param appName string = 'app-queuevisualizer-dev-swedencentral-001'

@description('Workspace used exclusively for this demo server telemetry.')
@minLength(4)
@maxLength(63)
param workspaceName string = 'log-queuevisualizer-dev-swedencentral-001'

@description('Workspace-based Application Insights component for server monitoring.')
@minLength(1)
@maxLength(260)
param insightsName string = 'appi-queuevisualizer-dev-swedencentral-001'

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2026-03-01' = {
  name: workspaceName
  location: location
  tags: {
    workload: 'queuevisualizer'
    environment: 'dev'
  }
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    workspaceCapping: {
      dailyQuotaGb: json('0.1')
    }
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  tags: {
    workload: 'queuevisualizer'
    environment: 'dev'
  }
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2026-08-01' = {
  name: planName
  location: location
  kind: 'linux'
  tags: {
    workload: 'queuevisualizer'
    environment: 'dev'
  }
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2026-08-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  tags: {
    workload: 'queuevisualizer'
    environment: 'dev'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|24-lts'
      appCommandLine: 'pm2 start server.mjs --node-args="--import=@azure/monitor-opentelemetry/loader" --no-daemon'
      alwaysOn: false
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      healthCheckPath: '/'
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
        {
          name: 'OTEL_SERVICE_NAME'
          value: 'queuevisualizer'
        }
      ]
    }
  }
}

resource scmPublishingPolicy 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2026-08-01' = {
  parent: webApp
  name: 'scm'
  properties: {
    allow: false
  }
}

resource ftpPublishingPolicy 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2026-08-01' = {
  parent: webApp
  name: 'ftp'
  properties: {
    allow: false
  }
}

output appName string = webApp.name
output websiteUrl string = 'https://${webApp.properties.defaultHostName}'
output applicationInsightsId string = applicationInsights.id
