# Script de PowerShell para construir las imágenes Docker
param(
    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest"
)

Write-Host "🚀 Construyendo imágenes Docker..." -ForegroundColor Green

# Construir imagen del backend
Write-Host "📦 Construyendo imagen del backend..." -ForegroundColor Yellow
docker build -t "fullstack-backend:$Tag" ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo imagen del backend" -ForegroundColor Red
    exit 1
}

# Construir imagen del frontend
Write-Host "📦 Construyendo imagen del frontend..." -ForegroundColor Yellow  
docker build -t "fullstack-frontend:$Tag" ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo imagen del frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imágenes construidas exitosamente!" -ForegroundColor Green

# Mostrar imágenes creadas
Write-Host "`n📋 Imágenes creadas:" -ForegroundColor Blue
docker images | findstr fullstack

Write-Host "`n🔧 Para ejecutar con Docker Compose:" -ForegroundColor Cyan
Write-Host "docker-compose up -d" -ForegroundColor White

Write-Host "`n🚀 Para desplegar en Kubernetes:" -ForegroundColor Cyan
Write-Host ".\deploy-k8s.ps1" -ForegroundColor White
