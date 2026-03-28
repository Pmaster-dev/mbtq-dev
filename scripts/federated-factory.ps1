# Federated Factory Management Script
# Supports @mbtq-dev (Engineering) and @deaf-first (Community) scopes

function factory-status {
    $scopes = @("@mbtq-dev", "@deaf-first")
    Write-Host "🏭 MBTQ Federated Factory Status" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan

    foreach ($scope in $scopes) {
        Write-Host "`nScope: $scope" -ForegroundColor Yellow
        $path = "C:\Dev\factory\$($scope.TrimStart('@'))"
        if (Test-Path $path) {
            Get-ChildItem $path -Directory | ForEach-Object {
                $manifest = Join-Path $_.FullName "manifest.json"
                if (Test-Path $manifest) {
                    $data = Get-Content $manifest | ConvertFrom-Json
                    $statusColor = if ($data.status -eq "OPERATIONAL") { "Green" } else { "Red" }
                    Write-Host "  ✅ $($data.name) - $($data.status)" -ForegroundColor $statusColor
                }
            }
        } else {
            Write-Host "  ⚠ Path not found: $path" -ForegroundColor Gray
        }
    }
}

# Scope-specific navigation
function f-mbtq { Set-Location C:\Dev\factory\mbtq-dev }
function f-deaf { Set-Location C:\Dev\factory\deaf-first }

# Federated environment switching
function set-env {
    param([string]$target = "dev", [string]$scope = "mbtq")
    Write-Host "Switching $scope to $target environment..." -ForegroundColor Cyan
    # Logic to update .env files or global state
}
