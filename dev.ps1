# Script de PowerShell para desarrollo y utilidades
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "logs", "shell", "migrate", "superuser", "clean")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "frontend", "postgres", "all")]
    [string]$Service = "all"
)

switch ($Action) {
    "start" {
        Write-Host "🚀 Iniciando servicios con Docker Compose..." -ForegroundColor Green
        if ($Service -eq "all") {
            docker-compose up -d
        } else {
            docker-compose up -d $Service
        }
        
        Write-Host "`n📋 Estado de los servicios:" -ForegroundColor Blue
        docker-compose ps
        
        Write-Host "`n🌐 URLs disponibles:" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "Backend API: http://localhost:8000/api/" -ForegroundColor White
        Write-Host "Django Admin: http://localhost:8000/admin/" -ForegroundColor White
        Write-Host "PostgreSQL: localhost:5432" -ForegroundColor White
    }
    
    "stop" {
        Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
        if ($Service -eq "all") {
            docker-compose down
        } else {
            docker-compose stop $Service
        }
    }
    
    "logs" {
        Write-Host "📜 Mostrando logs..." -ForegroundColor Blue
        if ($Service -eq "all") {
            docker-compose logs -f
        } else {
            docker-compose logs -f $Service
        }
    }
    
    "shell" {
        switch ($Service) {
            "backend" {
                Write-Host "🐚 Accediendo al shell del backend..." -ForegroundColor Green
                docker-compose exec backend python manage.py shell
            }
            "postgres" {
                Write-Host "🐚 Accediendo al shell de PostgreSQL..." -ForegroundColor Green
                docker-compose exec postgres psql -U postgres -d myproject_db
            }
            default {
                Write-Host "❌ Especifica un servicio válido para shell: backend, postgres" -ForegroundColor Red
            }
        }
    }
    
    "migrate" {
        Write-Host "🔄 Ejecutando migraciones..." -ForegroundColor Yellow
        docker-compose exec backend python manage.py makemigrations
        docker-compose exec backend python manage.py migrate
        Write-Host "✅ Migraciones completadas!" -ForegroundColor Green
    }
    
    "superuser" {
        Write-Host "👤 Creando superusuario..." -ForegroundColor Yellow
        docker-compose exec backend python manage.py createsuperuser
    }
    
    "clean" {
        Write-Host "🧹 Limpiando contenedores y volúmenes..." -ForegroundColor Red
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Host "✅ Limpieza completada!" -ForegroundColor Green
    }
}

Write-Host "`n💡 Comandos disponibles:" -ForegroundColor Cyan
Write-Host "./dev.ps1 start [service]    - Iniciar servicios" -ForegroundColor White
Write-Host "./dev.ps1 stop [service]     - Detener servicios" -ForegroundColor White  
Write-Host "./dev.ps1 logs [service]     - Ver logs" -ForegroundColor White
Write-Host "./dev.ps1 shell [service]    - Acceder al shell" -ForegroundColor White
Write-Host "./dev.ps1 migrate           - Ejecutar migraciones" -ForegroundColor White
Write-Host "./dev.ps1 superuser         - Crear superusuario" -ForegroundColor White
Write-Host "./dev.ps1 clean             - Limpiar todo" -ForegroundColor White
