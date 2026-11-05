# Queuevisualizer Azure deployment

Status: Deployed

## Monitoring addition

User approved server request/error monitoring and possible ingestion charges.
Keep existing F1 hosting. Add workspace-based Application Insights and a Log
Analytics workspace in the same approved resource group/subscription/region.
Wire server-only instrumentation; no browser tracking. Set a small daily
ingestion cap, document its limitations, and verify actual requests arrive.
Reuse direct Azure CLI validation/deployment rather than checklist helper runs.
Names: appi-queuevisualizer-dev-swedencentral-001 and
log-queuevisualizer-dev-swedencentral-001. Workspace cap 0.1 GB/day, 30-day
retention; cap is not a guaranteed spending ceiling. Explicit OpenTelemetry
instrumentation runs before Express with the ESM loader. Connection string is
provided by ARM app settings, never committed. Local use without it explicitly
reports telemetry disabled. Validate actual cloud ingestion after redeployment.

Monitoring validation (2026-11-06): `npm run lint` passed, both
`npm run test:hosting` tests passed, `az deployment group validate` succeeded.
`az deployment group what-if` shows two monitoring resources to create and four
existing Web resources to deploy, with no deletion or hosting tier upgrade.
No new identities or RBAC assignments are required.

Monitoring deployment completed: Application Insights and Log Analytics
provisioned successfully, and the Web App's connection string/startup loader
configured. Public HTTPS endpoint returns 200. A live Application Insights
query (`union requests, traces, exceptions | where timestamp > ago(1h) |
summarize count() by itemType`) returned one request, confirming server
telemetry ingestion. Additional local telemetry test work was stopped at
the user's request.

## 1. Overview

Commit the Kaitajarvi Kuormitusmittari application and host it on Azure App Service
in the user-selected existing resource group. No resources will be changed before
target and pricing approval.

## 2. Azure context

- Subscription: aa8e5073-bda3-45ad-a772-7c5989954f8e
- Resource group: rg-queuevisualizer
- Region: swedencentral (confirmed by user)
- Tenant: CLI verified against target subscription

## 3. Architecture

React/TypeScript static build, served by the existing Node.js Express adapter.
App Service Linux F1, Node.js 24 LTS (NODE|24-lts). Target resource group is empty.
One free plan and one public HTTPS Web App. No database, identity, paid monitoring,
or other supporting resources are needed for this fixed-data demo.

- Plan: asp-queuevisualizer-dev-swedencentral-001
- App: app-queuevisualizer-dev-swedencentral-001
- F1 limitations: shared CPU with daily limits, cold starts, no SLA or Always On.

## 4. Deployment recipe

Selected: AZCLI. Direct imperative control for an existing single-service demo,
without introducing azd or additional infrastructure services. Bicep templates
provide an ARM validation/what-if preview; a repeatable scripts/deploy.ps1 wrapper
provisions that template and publishes code. Source ZIP with Oryx build automation installs build
dependencies and builds TypeScript/Vite remotely; foreground PM2 runs server.mjs.

## 5. Execution steps

1. Inspect local Git state, Azure authentication, resource group and resources.
2. Confirm hosting target, SKU/cost, region, and Git publication scope.
3. Prepare repeatable deployment artifacts and documentation.
4. Validate local app, packaging, Azure runtime and permissions.
5. Commit approved files with the Copilot co-author trailer.
6. Deploy and verify the public HTTPS endpoint and actual UI.

## 6. Decisions and approvals

User approved F1 free hosting, this subscription/resource group/region, and
committing and pushing main to HVA-NextGen/queuevisualizer. Do not upgrade to a
paid tier on failure. Existing resources outside this group must not be changed.

## Provisioning limits and policy checks

- F1 Linux is available in Sweden Central according to az appservice list-locations.
- Node.js 24 LTS is active according to az webapp list-runtimes.
- Microsoft.Web is registered.
- Generic quota CLI check failed because Microsoft.Quota is not registered.
  No registration was performed. This limitation was disclosed and accepted.
- Microsoft.Web regional usage reports 0 / 16 regional VMs. This metric is not
  proof of free-tier availability; provisioning is the final capacity check.
- Existing resources in other groups will not be reused or modified.
- Azure MCP policy query failed due to its tenant mismatch; authenticated Azure
  CLI policy listing succeeded. Three Defender data-protection assignments were
  listed, with no target App Service restrictions evident in that listing.

## 7. Validation Proof

All validation checks pass:
- Core validation: CLI, authentication, Bicep compilation, ARM validation, what-if.
- No containers: Docker checks not applicable.
- Policy validation via successful ARM validation and CLI assignment listing.
- No managed identities or data-service roles required.

Actual checks:
- npm run lint: passed.
- npm test: 21 passed.
- npm run build: TypeScript and Vite passed.
- npm run test:hosting: 2 passed.
- Deployment PowerShell script syntax: passed.
- validate-deployment.ps1: OVERALL PASS, Azure CLI/auth/compile/ARM validation/
  what-if all passed. Preview: 5 Create, 0 Modify, 0 Delete (plan, app, two
  child credential policies, and resource-group metadata bookkeeping).
- Checks executed 2026-11-06 (local time). Commands:
  `npm run lint`, `npm test`, `npm run build`, `npm run test:hosting`,
  PowerShell Parser.ParseFile on scripts/deploy.ps1, and
  `validate-deployment.ps1 -Scope group -ResourceGroup rg-queuevisualizer
  -Subscription aa8e5073-bda3-45ad-a772-7c5989954f8e`.
- Static RBAC review: no managed identities, role assignments, secrets or
  data-service access in this static application. No RBAC changes required.
- Validation proof recorded and failures resolved. Final checklist steps reviewed
  directly at the user's request to stop running bookkeeping helpers.

## 8. Deployment results

- 2026-11-06: ARM deployment queuevisualizer succeeded; F1 Free plan confirmed.
- Source ZIP deployment fc077264-2595-4377-ac2e-a724a62693de reached RuntimeSuccessful.
- Live URL: https://app-queuevisualizer-dev-swedencentral-001.azurewebsites.net
- HTTPS root and JavaScript/CSS return 200. Missing asset returns 404.
- Browser verification: expected Finnish title, 24 bars, wellbeing services
  county in header/footer, and removed disclaimer absent.
- Runtime NODE|24-lts, foreground PM2, FTP disabled, HTTPS-only.
- No runtime identity or RBAC role assignments were created or required.
- Local Bicep emits BCP081 warnings for newer API type metadata; ARM validation
  and actual resource provisioning succeeded.
