param([switch]$Verbose)
$backend = "http://localhost:8000/api/v1"
$frontend = "http://localhost:3000"
$passed = 0; $failed = 0

function Test-Step {
    param($Name, $ScriptBlock)
    try {
        $result = & $ScriptBlock
        Write-Host "  ✓ $Name" -ForegroundColor Green
        $script:passed++
        if ($Verbose -and $result) { Write-Host "    $result" -ForegroundColor DarkGray }
        return $result
    } catch {
        Write-Host "  ✗ $Name`n    $_" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  ContaPro ERP - Validation Suite" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# ── Frontend ──
Write-Host "[1] FRONTEND" -ForegroundColor Yellow
Test-Step "Frontend serves homepage" {
    $r = Invoke-WebRequest -Uri $frontend -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    "HTTP $($r.StatusCode) ($($r.Content.Length) bytes)"
}

Test-Step "Frontend login page" {
    $r = Invoke-WebRequest -Uri "$frontend/login" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    "Login page served"
}

# ── Backend Health ──
Write-Host "`n[2] BACKEND HEALTH" -ForegroundColor Yellow
Test-Step "Health endpoint" {
    $r = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    $d = $r.Content | ConvertFrom-Json
    if ($d.status -ne "ok") { throw "Status not ok" }
    "v$($d.version)"
}

# ── Authentication ──
Write-Host "`n[3] AUTHENTICATION" -ForegroundColor Yellow
$script:token = $null
Test-Step "Login (admin/admin123)" {
    $r = Invoke-WebRequest -Uri "$backend/auth/login" -Method POST -UseBasicParsing -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
    $d = $r.Content | ConvertFrom-Json
    if (-not $d.access_token) { throw "No access_token in response" }
    $script:token = $d.access_token
    "Token: $($d.access_token.Substring(0,20))..."
}

Test-Step "Get current user (/auth/me)" {
    $r = Invoke-WebRequest -Uri "$backend/auth/me" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    if ($d.username -ne "admin") { throw "Wrong username: $($d.username)" }
    "$($d.full_name) <$($d.email)>"
}

Test-Step "List companies" {
    $r = Invoke-WebRequest -Uri "$backend/auth/companies" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    if ($d.Count -lt 1) { throw "No companies found" }
    "$($d[0].name) (NIT: $($d[0].nit))"
}

# ── PUC / Accounting ──
Write-Host "`n[4] PUC & ACCOUNTING" -ForegroundColor Yellow
Test-Step "Get PUC accounts" {
    $r = Invoke-WebRequest -Uri "$backend/accounting/puc" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) cuentas contables"
}

Test-Step "Trial balance" {
    $r = Invoke-WebRequest -Uri "$backend/accounting/trial-balance?end_date=2026-06-30" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    "OK"
}

Test-Step "Balance sheet" {
    $r = Invoke-WebRequest -Uri "$backend/accounting/balance-sheet?end_date=2026-06-30" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    "OK"
}

Test-Step "Income statement" {
    $r = Invoke-WebRequest -Uri "$backend/accounting/income-statement?start_date=2026-01-01&end_date=2026-06-30" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    "OK"
}

Test-Step "Accounting entries list" {
    $r = Invoke-WebRequest -Uri "$backend/accounting/entries" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) asientos contables"
}

# ── Financial ──
Write-Host "`n[5] FINANCIAL" -ForegroundColor Yellow
Test-Step "Financial indicators" {
    $r = Invoke-WebRequest -Uri "$backend/financial/indicators?year=2026&month=5" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) indicadores"
}

Test-Step "Cash flow" {
    $r = Invoke-WebRequest -Uri "$backend/financial/cash-flow?start_date=2026-01-01&end_date=2026-06-30" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    "OK"
}

# ── Dashboard ──
Write-Host "`n[6] DASHBOARD" -ForegroundColor Yellow
Test-Step "Dashboard summary" {
    $r = Invoke-WebRequest -Uri "$backend/dashboard/summary?year=2026&month=6" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "Assets: $($d.total_assets), Liabilities: $($d.total_liabilities), Clients: $($d.total_clients)"
}

Test-Step "Monthly evolution" {
    $r = Invoke-WebRequest -Uri "$backend/dashboard/monthly-evolution?year=2026" -UseBasicParsing -Headers @{Authorization="Bearer $script:token}"
    "OK"
}

Test-Step "Accounts receivable" {
    $r = Invoke-WebRequest -Uri "$backend/dashboard/accounts-receivable" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "OK - total_receivable: $($d.total_receivable)"
}

# ── Clients / Suppliers / Employees ──
Write-Host "`n[7] CLIENTS" -ForegroundColor Yellow
Test-Step "List clients" {
    $r = Invoke-WebRequest -Uri "$backend/clients/" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) clientes registrados"
}

Test-Step "List suppliers" {
    $r = Invoke-WebRequest -Uri "$backend/clients/suppliers" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) proveedores registrados"
}

Test-Step "List employees" {
    $r = Invoke-WebRequest -Uri "$backend/clients/employees" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) empleados registrados"
}

# ── Invoicing ──
Write-Host "`n[8] INVOICING" -ForegroundColor Yellow
Test-Step "List invoices" {
    $r = Invoke-WebRequest -Uri "$backend/invoicing/invoices" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) facturas registradas"
}

# ── Inventory ──
Write-Host "`n[9] INVENTORY" -ForegroundColor Yellow
Test-Step "List products" {
    $r = Invoke-WebRequest -Uri "$backend/inventory/products" -UseBasicParsing -Headers @{Authorization="Bearer $script:token"}
    $d = $r.Content | ConvertFrom-Json
    "$($d.Count) productos/servicios"
}

Test-Step "Stock alerts" {
    $r = Invoke-WebRequest -Uri "$backend/inventory/stock-alerts" -UseBasicParsing -Headers @{Authorization="Bearer $script:token}"
    "OK"
}

# ── Payroll ──
Write-Host "`n[10] PAYROLL" -ForegroundColor Yellow
Test-Step "List payroll periods" {
    $r = Invoke-WebRequest -Uri "$backend/payroll/periods?year=2026" -UseBasicParsing -Headers @{Authorization="Bearer $script:token}"
    "OK"
}

# ── API Docs ──
Write-Host "`n[11] API DOCS" -ForegroundColor Yellow
Test-Step "Swagger UI" {
    $r = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing
    "HTTP $($r.StatusCode)"
}

Test-Step "Frontend proxy to API (login via /api)" {
    $r = Invoke-WebRequest -Uri "$frontend/api/auth/login" -Method POST -UseBasicParsing -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
    $d = $r.Content | ConvertFrom-Json
    if (-not $d.access_token) { throw "Proxy failed - no token" }
    "Token: $($d.access_token.Substring(0,20))..."
}

# ── Summary ──
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor $(if ($failed -eq 0){'Green'}else{'Green'})
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -eq 0){'Green'}else{'Red'})
Write-Host "  Total:  $($passed + $failed)" -ForegroundColor Cyan
if ($failed -eq 0) { Write-Host "`n  ✓ ALL TESTS PASSED" -ForegroundColor Green }
else { Write-Host "`n  ✗ SOME TESTS FAILED" -ForegroundColor Red }
Write-Host "=========================================`n" -ForegroundColor Cyan
