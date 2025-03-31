# Script de despliegue para Windows (PowerShell)

# Verificar si AWS CLI está instalado
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI detectado: $awsVersion"
}
catch {
    Write-Host "Error: AWS CLI no está instalado o no está en el PATH." -ForegroundColor Red
    Write-Host "Por favor instala AWS CLI desde https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js detectado: $nodeVersion"
    Write-Host "npm detectado: $npmVersion"
}
catch {
    Write-Host "Error: Node.js no está instalado o no está en el PATH." -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar configuración de AWS
try {
    $awsConfig = aws configure list
    Write-Host "Configuración de AWS detectada."
}
catch {
    Write-Host "Error: AWS CLI no está configurado correctamente." -ForegroundColor Red
    Write-Host "Ejecuta 'aws configure' para configurar tus credenciales." -ForegroundColor Red
    exit 1
}

# Si existe un archivo .env.production, leerlo
$envFile = ".env.production"
$bucketName = "frontend-bedrock-agent-dove" # Valor por defecto

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    Write-Host "Archivo .env.production detectado."
    
    # En producción, el nombre del bucket debería venir de Terraform
    # Aquí usamos un valor por defecto para pruebas manuales
}
else {
    Write-Host "Advertencia: No se encontró archivo .env.production. Usando valores por defecto." -ForegroundColor Yellow
    
    # Creamos un archivo .env.production básico
    "VITE_API_URL=https://tu-api-gateway-url/dev/agent" | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "Se ha creado un archivo .env.production con valores de ejemplo." -ForegroundColor Yellow
}

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudieron instalar las dependencias." -ForegroundColor Red
    exit 1
}

# Compilar la aplicación
Write-Host "Compilando la aplicación..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo compilar la aplicación." -ForegroundColor Red
    exit 1
}

# Desplegar en S3
Write-Host "Desplegando en S3..." -ForegroundColor Cyan
aws s3 sync dist/ s3://$bucketName --delete

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo desplegar en S3." -ForegroundColor Red
    exit 1
}

Write-Host "¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "La aplicación está disponible en: http://$bucketName.s3-website-us-east-1.amazonaws.com" -ForegroundColor Green 