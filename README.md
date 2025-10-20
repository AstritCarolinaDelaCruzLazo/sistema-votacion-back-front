# Fullstack Kubernetes Application

Una aplicación completa con **React** (frontend) y **Django** (backend) preparada para despliegue en **Kubernetes**.

## Novedades (DNI Login y Verificación Facial)

- **Login por DNI**: `POST /api/login-dni/` devuelve un token propio (no expira) asociado al DNI.
- **Protección de endpoints**: Se acepta `Authorization: Bearer <token>` tanto con el token por DNI como con JWT.
- **Verificación de DNI**: `GET /api/dni/?numero=XXXXXXXX` (el backend usa un token interno de RENIEC).
- **Verificación facial**: `POST /api/face-verify/` (multipart con `selfie` y `dni`).
 - **Gate biométrico (WebAuthn/Passkeys)**: El frontend exige autenticador de plataforma (huella/biometría) en dispositivos compatibles y ejecuta un registro WebAuthn contra el backend antes de permitir el uso.

## 🚀 Características

- **Frontend**: React 18 con componentes modernos y conexión a API
- **Backend**: Django 4.2 con Django REST Framework
- **Base de datos**: PostgreSQL 15
- **Contenedores**: Docker con multi-stage builds
- **Orquestación**: Kubernetes con escalado automático
- **Desarrollo**: Docker Compose para desarrollo local

## 📁 Estructura del Proyecto

```
fullstack-k8s-project/
├── backend/                 # Aplicación Django
│   ├── api/                # API REST
│   ├── myproject/          # Configuración Django
│   ├── Dockerfile          # Imagen Docker del backend
│   ├── entrypoint.sh       # Script de inicialización
│   └── requirements.txt    # Dependencias Python
├── frontend/               # Aplicación React
│   ├── src/               # Código fuente React
│   ├── public/            # Archivos públicos
│   ├── Dockerfile         # Imagen Docker del frontend
│   └── nginx.conf         # Configuración Nginx
├── k8s/                   # Configuraciones Kubernetes
│   ├── namespace.yaml     # Namespace
│   ├── configmap.yaml     # Configuraciones
│   ├── secrets.yaml       # Secretos
│   ├── persistent-volumes.yaml # Almacenamiento
│   ├── postgres-deployment.yaml # Base de datos
│   ├── backend-deployment.yaml  # API Backend
│   ├── frontend-deployment.yaml # Frontend
│   └── ingress.yaml       # Ingreso HTTP
├── docker-compose.yml     # Orquestación local
├── build.ps1              # Script de construcción
├── deploy-k8s.ps1         # Script de despliegue K8s
├── dev.ps1                # Utilidades de desarrollo
└── README.md              # Este archivo
```

## 🛠️ Requisitos Previos

### Local (sin Docker)
- Python 3.10+ (recomendado 3.12)
- Node.js 18 LTS (o superior)

### Para Desarrollo Local (Docker Compose)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Para Kubernetes
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Un cluster de Kubernetes (Minikube, Docker Desktop, etc.)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

## 🚀 Inicio Rápido

### A) Local sin Docker (desarrollo)

1. Backend

```powershell
cd backend

# Variables de entorno (crear backend/.env)
# RENEIC_TOKEN es requerido para /api/dni/
# RENEIC_API es opcional (tiene default)
@"
RENEIC_TOKEN=TU_TOKEN_RENIEC
RENEIC_API=https://api.decolecta.com/v1/reniec/dni
"@ | Out-File -Encoding utf8 .env

pip install -r requirements.txt
python manage.py makemigrations dni_checker
python manage.py migrate
python manage.py runserver
```

2. Frontend

```powershell
cd frontend
setx REACT_APP_API_URL "http://127.0.0.1:8000/api"
npm install
npm start
```

3. Probar el flujo

- Login por DNI (desde el frontend): ingresa tu DNI, se guardará el token en el navegador.
- Se solicitará verificación biométrica (WebAuthn). En dispositivos compatibles, confirma con huella/biometría.
- Luego sube `selfie` y foto de `dni` en la pantalla de Registro de Foto.

Notas CORS: el backend ya permite `http://localhost:3000` y `http://127.0.0.1:3000`.

### Requisitos WebAuthn (biometría)

- WebAuthn requiere "secure context". En desarrollo, `http://localhost` funciona; en producción, usa **HTTPS** y un RP ID (dominio) estable.
- El gate biométrico usa autenticador de plataforma (ej.: lector de huella del móvil). Si no hay dispositivo compatible, el uso queda bloqueado con un mensaje claro.
- Implementación actual de verificación en backend es mínima (demo). Para producción, usar una librería de verificación (p.ej. `py_webauthn`) para validar attestation/assertion y firmas.

### B) Con Docker/Kubernetes

```powershell
# Construir las imágenes Docker
.\build.ps1
```

### 2. Desarrollo Local con Docker Compose

```powershell
# Iniciar todos los servicios
.\dev.ps1 start

# Ver logs
.\dev.ps1 logs

# Acceder al shell de Django
.\dev.ps1 shell backend

# Ejecutar migraciones
.\dev.ps1 migrate

# Crear superusuario
.\dev.ps1 superuser

# Detener servicios
.\dev.ps1 stop
```

**URLs locales:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

### 3. Despliegue en Kubernetes

```powershell
# Desplegar en Kubernetes
.\deploy-k8s.ps1

# Eliminar despliegue
.\deploy-k8s.ps1 -Delete
```

**Agregar a tu archivo hosts:**
```
127.0.0.1 fullstack.local api.fullstack.local fullstack-app.local
```

**URLs de Kubernetes:**
- Frontend: http://fullstack.local
- API: http://api.fullstack.local
- Alternativa: http://fullstack-app.local

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/token/` - Obtener JWT (usuario/contraseña de Django)
- `POST /api/auth/token/refresh/` - Refrescar JWT
- `POST /api/login-dni/` - Login con DNI (devuelve token no expirable)

### DNI y Rostro
- `GET /api/dni/?numero=XXXXXXXX` - Verifica DNI contra RENIEC (requiere Authorization)
- `POST /api/face-verify/` - Verifica similitud de rostro (multipart: `selfie`, `dni`) (requiere Authorization)

### WebAuthn (Biometría)
- `POST /api/webauthn/register/options/` - Opciones para `navigator.credentials.create()`
- `POST /api/webauthn/register/verify/` - Verifica y registra la credencial
- `POST /api/webauthn/authenticate/options/` - Opciones para `navigator.credentials.get()` (si activas autenticación)
- `POST /api/webauthn/authenticate/verify/` - Verifica assertion (si activas autenticación)

Authorization en frontend/back:
```
Authorization: Bearer <TOKEN>
```
Acepta tanto el token de DNI como el JWT.

## 🏗️ Arquitectura

### Componentes

1. **Frontend (React)**
   - Servidor Nginx con archivos estáticos
   - Comunicación con backend vía API REST
   - Interfaz moderna y responsiva

2. **Backend (Django)**
   - API REST con Django REST Framework
   - Autenticación por token
   - Modelo de tareas con usuarios

3. **Base de Datos (PostgreSQL)**
   - Almacenamiento persistente
   - Configuración optimizada para producción

### Kubernetes Features

- **Escalado Automático**: HPA configurado para CPU y memoria
- **Salud**: Health checks para todos los servicios
- **Persistencia**: Volúmenes persistentes para PostgreSQL
- **Seguridad**: Secretos para credenciales
- **Ingreso**: Nginx Ingress para acceso externo

## 🔒 Configuración de Seguridad

### Variables de Entorno

```bash
# Backend
SECRET_KEY=your-secret-key
DEBUG=False
DB_PASSWORD=secure-password
DJANGO_SUPERUSER_PASSWORD=admin-password

# Frontend  
REACT_APP_API_URL=http://api.fullstack.local/api
```

### Secretos de Kubernetes

Los secretos están codificados en base64 en `k8s/secrets.yaml`. Para actualizar:

```powershell
# Generar nuevo secreto
echo -n "nuevo-valor" | base64
```

## 📊 Monitoreo

### Logs de Desarrollo
```powershell
# Ver logs en tiempo real
.\dev.ps1 logs

# Logs específicos
.\dev.ps1 logs backend
.\dev.ps1 logs frontend
```

### Logs de Kubernetes
```powershell
# Ver estado de pods
kubectl get pods -n fullstack-app

# Logs en tiempo real
kubectl logs -f deployment/backend -n fullstack-app
kubectl logs -f deployment/frontend -n fullstack-app

# Describir problemas
kubectl describe pod <pod-name> -n fullstack-app
```

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos**
   - Verificar que PostgreSQL esté ejecutándose
   - Revisar variables de entorno de conexión

2. **Frontend no puede conectar al backend**
   - Verificar REACT_APP_API_URL
   - Revisar configuración CORS en Django
   - Reiniciar el backend tras cambios en settings/.env

3. **Pods en estado Pending en Kubernetes**
   - Verificar recursos disponibles en el cluster
   - Revisar PersistentVolumes

4. **Error “Apikey Required / Limit Exceeded” en /api/dni/**
   - Asegura que `RENEIC_TOKEN` sea válido (sin comillas/espacios)
   - Reintenta; el backend prueba varios estilos de autenticación comunes
   - Si el proveedor exige un header exacto, ajústalo en `dni_checker/views.py`

5. **Tabla DNIToken no existe**
   - Ejecuta migraciones:
   ```powershell
   cd backend
   python manage.py makemigrations dni_checker
   python manage.py migrate
   ```

6. **Biometría no disponible**
   - Verifica que el dispositivo tenga autenticador de plataforma (huella/biometría) y que el navegador soporte WebAuthn.
   - En producción, usa HTTPS y un dominio estable (RP ID) que coincida con `rp.id`.
   - Si la verificación `register/verify` falla, revisa los logs del backend. Considera integrar `py_webauthn` para validaciones estrictas.

### Comandos Útiles

```powershell
# Reiniciar servicios
.\dev.ps1 stop
.\dev.ps1 start

# Limpiar todo y empezar de nuevo
.\dev.ps1 clean

# Reconstruir imágenes
.\build.ps1

# Verificar estado en Kubernetes
kubectl get all -n fullstack-app
```