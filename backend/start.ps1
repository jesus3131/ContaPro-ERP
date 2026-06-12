param(
    [switch]$Build,
    [switch]$Test,
    [switch]$Docker,
    [switch]$SQLite
)

$ErrorActionPreference = "Stop"
$LogDir = Join-Path $PSScriptRoot "logs"
$null = New-Item -ItemType Directory -Path $LogDir -Force
$LogFile = Join-Path $LogDir "start-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$GlobalLogFile = $LogFile

function Write-Log {
    param([string]$Message, [string]$ForegroundColor = "Gray")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $Message"
    Add-Content -Path $GlobalLogFile -Value $line -Encoding UTF8
    if ($ForegroundColor -ne "Gray") {
        Write-Host $line -ForegroundColor $ForegroundColor
    } else {
        Write-Host $line
    }
}

function Test-Port {
    param([int]$Port)
    $conn = netstat -ano | Select-String ":${Port}\s"
    $listening = $conn | Where-Object { $_ -match "LISTENING" }
    if ($listening) {
        $pid = ($listening -split '\s+')[-1]
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        return $true, $pid, $proc.ProcessName
    }
    return $false, $null, $null
}

function Get-FreePort {
    param([int]$Preferred, [string]$ProcessName)
    $inUse, $pid, $name = Test-Port -Port $Preferred
    if (-not $inUse) { return $Preferred }
    Write-Log "Puerto $Preferred en uso por $name (PID $pid)" -ForegroundColor Yellow
    for ($p = 8001; $p -lt 8100; $p++) {
        $u, $_, $_ = Test-Port -Port $p
        if (-not $u) { return $p }
    }
    throw "No hay puertos libres en el rango 8000-8099"
}

function Wait-ForHealth {
    param([string]$Url, [string]$Name, [int]$Retries = 30, [int]$DelayMs = 1000)
    Write-Log "Esperando a $Name ($Url)..." -ForegroundColor Gray
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($r.StatusCode -eq 200) {
                Write-Log "$Name listo (intento $($i+1))" -ForegroundColor Green
                return $true
            }
        } catch {
            if ($i -eq $Retries - 1) {
                Write-Log "$Name no respondio tras $Retries intentos" -ForegroundColor Red
                return $false
            }
            Start-Sleep -Milliseconds $DelayMs
        }
    }
    return $false
}

function Start-ServiceWithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [string]$Name,
        [int]$MaxRetries = 3
    )
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        Write-Log "Iniciando $Name (intento $attempt de $MaxRetries)..." -ForegroundColor Yellow
        try {
            $job = Start-Job -Name $Name -ScriptBlock $ScriptBlock
            return $job
        } catch {
            Write-Log "Fallo al iniciar $Name: $_" -ForegroundColor Red
            if ($attempt -eq $MaxRetries) { throw }
            Start-Sleep -Seconds 3
        }
    }
}

# ── Encabezado ──
Write-Log "=========================================" -ForegroundColor Cyan
Write-Log "  ContaPro ERP Colombia - Inicio" -ForegroundColor Cyan
Write-Log "=========================================" -ForegroundColor Cyan
Write-Log "Log: $LogFile" -ForegroundColor White

if ($Docker) {
    Write-Log "Iniciando con Docker Compose..." -ForegroundColor Yellow
    docker-compose up --build
    return
}

# ── 1. Validar rutas ──
Write-Log "--- Validando rutas ---" -ForegroundColor Yellow
$BackendDir = Join-Path $PSScriptRoot "backend"
$FrontendDir = Join-Path $PSScriptRoot "frontend"
$RunPy = Join-Path $BackendDir "run.py"
$Requirements = Join-Path $BackendDir "requirements.txt"

if (-not (Test-Path $RunPy)) { Write-Log "No encontrado: $RunPy" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $Requirements)) { Write-Log "No encontrado: $Requirements" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $FrontendDir)) { Write-Log "No encontrado: $FrontendDir" -ForegroundColor Red; exit 1 }
Write-Log "Rutas validadas" -ForegroundColor Green

# ── 2. Verificar dependencias del sistema ──
Write-Log "--- Verificando dependencias del sistema ---" -ForegroundColor Yellow
$envOk = $true

$pythonExe = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $pythonExe) {
    Write-Log "Python no encontrado en PATH" -ForegroundColor Red
    $envOk = $false
} else {
    $pyVer = python --version 2>&1
    Write-Log "Python: $pyVer ($pythonExe)" -ForegroundColor Green
}

$pnpmExe = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
if (-not $pnpmExe) {
    Write-Log "pnpm no encontrado (npm install -g pnpm)" -ForegroundColor Red
    $envOk = $false
} else {
    $pnVer = pnpm --version 2>&1
    Write-Log "pnpm: $pnVer ($pnpmExe)" -ForegroundColor Green
}

if (-not $envOk) {
    Write-Log "Corrige los errores e intenta de nuevo." -ForegroundColor Red
    exit 1
}

# ── 3. Verificar puertos ──
Write-Log "--- Verificando puertos ---" -ForegroundColor Yellow
$backendPort = 8000
$frontendPort = 3000
$bInUse, $bPid, $bName = Test-Port -Port $backendPort
$fInUse, $fPid, $fName = Test-Port -Port $frontendPort

if ($bInUse) {
    Write-Log "Puerto $backendPort en uso por $bName (PID $bPid)" -ForegroundColor Yellow
    Write-Log "Finalizando proceso $bName (PID $bPid)..." -ForegroundColor Yellow
    Stop-Process -Id $bPid -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
    $stillInUse, $_, $_ = Test-Port -Port $backendPort
    if ($stillInUse) {
        Write-Log "No se pudo liberar puerto $backendPort" -ForegroundColor Red
        exit 1
    }
    Write-Log "Puerto $backendPort liberado" -ForegroundColor Green
}

if ($fInUse) {
    # For frontend port, just warn, don't kill (might be another app)
    Write-Log "Puerto $frontendPort en uso por $fName (PID $fPid)" -ForegroundColor Yellow
}

Write-Log "Puertos disponibles: backend=$backendPort frontend=$frontendPort" -ForegroundColor Green

# ── 4. Backend ──
Write-Log "--- Iniciando Backend ---" -ForegroundColor Yellow
$venvDir = Join-Path $BackendDir "venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path $venvDir)) {
    Write-Log "Creando entorno virtual..." -ForegroundColor Gray
    python -m venv $venvDir
    if (-not (Test-Path $venvPython)) {
        Write-Log "Fallo al crear el entorno virtual" -ForegroundColor Red
        exit 1
    }
    Write-Log "Entorno virtual creado" -ForegroundColor Green
}

# ── 5. Verificar/instalar dependencias del backend ──
Write-Log "Instalando dependencias del backend..." -ForegroundColor Gray
$pip = Join-Path $venvDir "Scripts\pip.exe"
$installLog = Join-Path $LogDir "pip-install.log"
$proc = Start-Process -FilePath $pip -ArgumentList "install", "-r", $Requirements, "-q" -NoNewWindow -Wait -PassThru -RedirectStandardOutput $installLog -RedirectStandardError $installLog
if ($proc.ExitCode -ne 0) {
    Write-Log "Fallo al instalar dependencias (exit code: $($proc.ExitCode))" -ForegroundColor Red
    Get-Content $installLog -Tail 20 | ForEach-Object { Write-Log "pip: $_" -ForegroundColor Red }
    exit 1
}
Write-Log "Dependencias instaladas" -ForegroundColor Green

# ── 6. Configurar entorno ──
$envArgs = @()
if ($SQLite) {
    $envArgs = @{USE_SQLITE = "true" }
}

# ── 7. Iniciar backend ──
$backendLog = Join-Path $LogDir "backend.log"
$backendErrLog = Join-Path $LogDir "backend-error.log"

$backendJob = Start-Job -Name "ContaProBackend" -ScriptBlock {
    param($PyExe, $WorkDir, $UseSqlite, $StdOutFile, $StdErrFile)
    if ($UseSqlite) { $env:USE_SQLITE = "true" }
    Set-Location $WorkDir
    $env:PYTHONIOENCODING = "utf-8"
    # Redirigir salida a archivos
    & $PyExe run.py *>> $StdOutFile 2>> $StdErrFile
    exit $LASTEXITCODE
} -ArgumentList $venvPython, $BackendDir, $SQLite, $backendLog, $backendErrLog

# ── 8. Esperar a que el backend esté listo ──
$backendReady = Wait-ForHealth -Url "http://localhost:8000/health" -Name "Backend" -Retries 30 -DelayMs 1000
if (-not $backendReady) {
    Write-Log "Backend no inicio correctamente. Revisa los logs:" -ForegroundColor Red
    if (Test-Path $backendErrLog) { Get-Content $backendErrLog -Tail 20 | ForEach-Object { Write-Log "ERR: $_" -ForegroundColor Red } }
    if (Test-Path $backendLog) { Get-Content $backendLog -Tail 10 | ForEach-Object { Write-Log "OUT: $_" -ForegroundColor DarkYellow } }
    Write-Log "Reintentando..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    $backendReady = Wait-ForHealth -Url "http://localhost:8000/health" -Name "Backend (reintento)" -Retries 20 -DelayMs 1000
    if (-not $backendReady) {
        Write-Log "Backend no responde. Abortando." -ForegroundColor Red
        exit 1
    }
}
Write-Log "Backend corriendo en http://localhost:8000" -ForegroundColor Green

# ── 9. Frontend ──
Write-Log "--- Iniciando Frontend ---" -ForegroundColor Yellow
$envFile = Join-Path $FrontendDir ".env.local"
if (-not (Test-Path $envFile)) {
    Set-Content -Path $envFile -Value "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`r`nBACKEND_URL=http://localhost:8000"
    Write-Log "Creado $envFile" -ForegroundColor Green
}

Write-Log "Instalando dependencias del frontend..." -ForegroundColor Gray
Set-Location $FrontendDir
pnpm install --frozen-lockfile 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
    Write-Log "pnpm install fallo, reintentando sin frozen-lockfile..." -ForegroundColor Yellow
    pnpm install 2>&1 | Out-Null
}
Write-Log "Dependencias del frontend instaladas" -ForegroundColor Green

$frontendLog = Join-Path $LogDir "frontend.log"
$frontendErrLog = Join-Path $LogDir "frontend-error.log"

$frontendJob = Start-Job -Name "ContaProFrontend" -ScriptBlock {
    param($Dir, $StdOutFile, $StdErrFile)
    Set-Location $Dir
    pnpm dev *>> $StdOutFile 2>> $StdErrFile
} -ArgumentList $FrontendDir, $frontendLog, $frontendErrLog

$frontendReady = Wait-ForHealth -Url "http://localhost:3000" -Name "Frontend" -Retries 60 -DelayMs 1000
if ($frontendReady) {
    Write-Log "Frontend corriendo en http://localhost:3000" -ForegroundColor Green
} else {
    Write-Log "Frontend no responde (puede tardar mas)" -ForegroundColor Yellow
}

# ── 10. Resumen ──
Write-Log "=========================================" -ForegroundColor Cyan
Write-Log "  SISTEMA LISTO" -ForegroundColor Green
Write-Log "=========================================" -ForegroundColor Cyan
Write-Log "  Frontend:   http://localhost:3000" -ForegroundColor White
Write-Log "  Login:      http://localhost:3000/login" -ForegroundColor White
Write-Log "  Backend:    http://localhost:8000" -ForegroundColor White
Write-Log "  API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Log "  Health:     http://localhost:8000/health" -ForegroundColor White
Write-Log "  Logs:       $LogDir" -ForegroundColor White
Write-Log "-----------------------------------------" -ForegroundColor Cyan
Write-Log "  Usuario: admin" -ForegroundColor Yellow
Write-Log "  Clave:   admin123" -ForegroundColor Yellow
Write-Log "=========================================" -ForegroundColor Cyan

if ($Test) {
    Write-Log "Ejecutando pruebas de validacion..." -ForegroundColor Yellow
    $testScript = Join-Path $PSScriptRoot "validation_test.ps1"
    if (Test-Path $testScript) { & $testScript }
}

# ── 11. Monitoreo con reinicio automatico ──
Write-Log "Presiona Ctrl+C para detener ambos servicios" -ForegroundColor Gray

$restartCount = @{backend = 0; frontend = 0}
$maxRestarts = 5

try {
    while ($true) {
        Start-Sleep -Seconds 5

        # Monitorear backend
        if ($backendJob.State -eq "Failed") {
            $restartCount["backend"]++
            $errorOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
            Write-Log "Backend fallo (intento $($restartCount['backend'])/$maxRestarts)" -ForegroundColor Red
            if ($errorOutput) { Write-Log "Error: $errorOutput" -ForegroundColor Red }

            if (Test-Path $backendErrLog) {
                Get-Content $backendErrLog -Tail 10 | ForEach-Object { Write-Log "  $_" -ForegroundColor Red }
            }

            if ($restartCount["backend"] -ge $maxRestarts) {
                Write-Log "Demasiados reinicios del backend. Abortando." -ForegroundColor Red
                break
            }

            Write-Log "Reiniciando backend en 3 segundos..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3

            # Limpiar logs viejos
            Remove-Item $backendLog -ErrorAction SilentlyContinue
            Remove-Item $backendErrLog -ErrorAction SilentlyContinue

            Remove-Job $backendJob -ErrorAction SilentlyContinue
            $backendJob = Start-Job -Name "ContaProBackend" -ScriptBlock {
                param($PyExe, $WorkDir, $UseSqlite, $StdOutFile, $StdErrFile)
                if ($UseSqlite) { $env:USE_SQLITE = "true" }
                Set-Location $WorkDir
                & $PyExe run.py *>> $StdOutFile 2>> $StdErrFile
            } -ArgumentList $venvPython, $BackendDir, $SQLite, $backendLog, $backendErrLog

            $backendReady = Wait-ForHealth -Url "http://localhost:8000/health" -Name "Backend (reinicio)" -Retries 15 -DelayMs 1000
            if ($backendReady) {
                Write-Log "Backend reiniciado correctamente" -ForegroundColor Green
            } else {
                Write-Log "Backend no respondio tras reinicio" -ForegroundColor Red
            }
        }

        # Monitorear frontend
        if ($frontendJob.State -eq "Failed") {
            $restartCount["frontend"]++
            Write-Log "Frontend fallo (intento $($restartCount['frontend'])/$maxRestarts)" -ForegroundColor Red

            if ($restartCount["frontend"] -ge $maxRestarts) {
                Write-Log "Demasiados reinicios del frontend. Abortando." -ForegroundColor Red
                break
            }

            Write-Log "Reiniciando frontend en 3 segundos..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            Remove-Item $frontendLog -ErrorAction SilentlyContinue
            Remove-Item $frontendErrLog -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            $frontendJob = Start-Job -Name "ContaProFrontend" -ScriptBlock {
                param($Dir, $StdOutFile, $StdErrFile)
                Set-Location $Dir
                pnpm dev *>> $StdOutFile 2>> $StdErrFile
            } -ArgumentList $FrontendDir, $frontendLog, $frontendErrLog
        }
    }
} finally {
    Write-Log "Deteniendo servicios..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Log "Servicios detenidos" -ForegroundColor Green
}
