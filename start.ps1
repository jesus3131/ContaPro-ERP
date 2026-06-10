param(
    [switch]$Build,
    [switch]$Test,
    [switch]$Docker
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ContaPro ERP Colombia - Inicio" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($Docker) {
    Write-Host "`nIniciando con Docker Compose..." -ForegroundColor Yellow
    docker-compose up --build
    return
}

# ── Verificar dependencias ──
$envOk = $true

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Python no encontrado" -ForegroundColor Red
    $envOk = $false
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ pnpm no encontrado (npm install -g pnpm)" -ForegroundColor Red
    $envOk = $false
}

if (-not $envOk) {
    Write-Host "`nCorrige los errores e intenta de nuevo." -ForegroundColor Red
    exit 1
}

# ── Backend ──
Write-Host "`n[1] INICIANDO BACKEND" -ForegroundColor Yellow
$backendDir = Join-Path $PSScriptRoot "backend"
$venvDir = Join-Path $backendDir "venv"

if (-not (Test-Path $venvDir)) {
    Write-Host "  Creando entorno virtual..." -ForegroundColor Gray
    python -m venv $venvDir
}

# Activar venv y verificar / instalar dependencias
$pip = Join-Path $venvDir "Scripts\pip.exe"
$python = Join-Path $venvDir "Scripts\python.exe"

Write-Host "  Instalando dependencias del backend..." -ForegroundColor Gray
& $pip install -r (Join-Path $backendDir "requirements.txt") -q

Write-Host "  Iniciando backend en http://localhost:8000" -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($python, $dir)
    Set-Location $dir
    & $python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} -ArgumentList $python, $backendDir

# Esperar a que el backend esté listo
Write-Host "  Esperando al backend..." -ForegroundColor Gray
$maxRetries = 30
for ($i = 0; $i -lt $maxRetries; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            Write-Host "  ✓ Backend listo" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

# ── Frontend ──
Write-Host "`n[2] INICIANDO FRONTEND" -ForegroundColor Yellow
$frontendDir = Join-Path $PSScriptRoot "frontend"
$envFile = Join-Path $frontendDir ".env.local"

if (-not (Test-Path $envFile)) {
    Set-Content -Path $envFile -Value "BACKEND_URL=http://localhost:8000"
    Write-Host "  Creado .env.local" -ForegroundColor Gray
}

Write-Host "  Instalando dependencias del frontend..." -ForegroundColor Gray
Set-Location $frontendDir
pnpm install --frozen-lockfile 2>&1 | Out-Null

Write-Host "  Iniciando frontend en http://localhost:3000" -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    pnpm dev
} -ArgumentList $frontendDir

# Esperar al frontend
Write-Host "  Esperando al frontend..." -ForegroundColor Gray
for ($i = 0; $i -lt $maxRetries; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            Write-Host "  ✓ Frontend listo" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

# ── Mostrar URLs ──
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  SISTEMA LISTO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Frontend:   http://localhost:3000" -ForegroundColor White
Write-Host "  Login:      http://localhost:3000/login" -ForegroundColor White
Write-Host "  Backend:    http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Health:     http://localhost:8000/health" -ForegroundColor White
Write-Host "-----------------------------------------" -ForegroundColor Cyan
Write-Host "  Usuario: admin" -ForegroundColor Yellow
Write-Host "  Clave:   admin123" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

if ($Test) {
    Write-Host "`nEjecutando pruebas de validación..." -ForegroundColor Yellow
    $testScript = Join-Path $PSScriptRoot "validation_test.ps1"
    & $testScript
}

# Mantener el script vivo
Write-Host "`nPresiona Ctrl+C para detener ambos servicios" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 5
        $bj = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        $fj = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($bj) { Write-Host "Backend: $bj" -ForegroundColor DarkGray }
        if ($fj) { Write-Host "Frontend: $fj" -ForegroundColor DarkGray }
        if ($backendJob.State -eq "Failed") {
            Write-Host "  ✗ Backend se detuvo inesperadamente" -ForegroundColor Red
            Receive-Job -Job $backendJob
            break
        }
        if ($frontendJob.State -eq "Failed") {
            Write-Host "  ✗ Frontend se detuvo inesperadamente" -ForegroundColor Red
            Receive-Job -Job $frontendJob
            break
        }
    }
} finally {
    Write-Host "`nDeteniendo servicios..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "  ✓ Servicios detenidos" -ForegroundColor Green
}
