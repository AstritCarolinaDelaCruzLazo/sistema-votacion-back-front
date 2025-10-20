# Script de PowerShell para desplegar en Kubernetes
param(
    [Parameter(Mandatory=$false)]
    [switch]$Delete,
    [Parameter(Mandatory=$false)]
    [switch]$Update
)

$namespace = "fullstack-app"

if ($Delete) {
    Write-Host "🗑️ Eliminando despliegue de Kubernetes..." -ForegroundColor Red
    kubectl delete namespace $namespace --ignore-not-found=true
    Write-Host "✅ Despliegue eliminado!" -ForegroundColor Green
    exit 0
}

Write-Host "🚀 Desplegando aplicación fullstack en Kubernetes..." -ForegroundColor Green

# Verificar si kubectl está disponible
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl no está disponible. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar conexión al cluster
try {
    kubectl cluster-info | Out-Null
} catch {
    Write-Host "❌ No se puede conectar al cluster de Kubernetes" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Aplicando configuraciones de Kubernetes..." -ForegroundColor Yellow

# Aplicar archivos en orden
$files = @(
    "k8s/namespace.yaml",
    "k8s/configmap.yaml", 
    "k8s/secrets.yaml",
    "k8s/persistent-volumes.yaml",
    "k8s/postgres-deployment.yaml",
    "k8s/backend-deployment.yaml",
    "k8s/frontend-deployment.yaml",
    "k8s/ingress.yaml"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "⚙️ Aplicando $file..." -ForegroundColor Cyan
        kubectl apply -f $file
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error aplicando $file" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⚠️ Archivo no encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "✅ Configuraciones aplicadas exitosamente!" -ForegroundColor Green

# Esperar a que los pods estén listos
Write-Host "`n⏳ Esperando a que los pods estén listos..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n $namespace
kubectl wait --for=condition=available --timeout=300s deployment/backend -n $namespace  
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n $namespace

Write-Host "`n📋 Estado del despliegue:" -ForegroundColor Blue
kubectl get pods -n $namespace
kubectl get services -n $namespace
kubectl get ingress -n $namespace

Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "Frontend: http://fullstack.local" -ForegroundColor White
Write-Host "API: http://api.fullstack.local" -ForegroundColor White
Write-Host "Alternativa (un dominio): http://fullstack-app.local" -ForegroundColor White

Write-Host "`n📝 Agregar a tu archivo hosts:" -ForegroundColor Yellow
$minikubeIP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'
Write-Host "$minikubeIP fullstack.local api.fullstack.local fullstack-app.local" -ForegroundColor White

Write-Host "`n🔍 Para monitorear:" -ForegroundColor Cyan  
Write-Host "kubectl get pods -n $namespace -w" -ForegroundColor White
Write-Host "kubectl logs -f deployment/backend -n $namespace" -ForegroundColor White
Write-Host "kubectl logs -f deployment/frontend -n $namespace" -ForegroundColor White
