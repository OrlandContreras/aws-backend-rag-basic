#!/bin/bash
# Script de despliegue para sistemas Unix (Linux/macOS)

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar si AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI no está instalado o no está en el PATH.${NC}"
    echo -e "${RED}Por favor instala AWS CLI desde https://aws.amazon.com/cli/${NC}"
    exit 1
fi

# Mostrar versión de AWS CLI
aws_version=$(aws --version)
echo -e "AWS CLI detectado: ${aws_version}"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado o no está en el PATH.${NC}"
    echo -e "${RED}Por favor instala Node.js desde https://nodejs.org/${NC}"
    exit 1
fi

# Mostrar versiones de Node.js y npm
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "Node.js detectado: ${node_version}"
echo -e "npm detectado: ${npm_version}"

# Verificar configuración de AWS
if ! aws configure list &> /dev/null; then
    echo -e "${RED}Error: AWS CLI no está configurado correctamente.${NC}"
    echo -e "${RED}Ejecuta 'aws configure' para configurar tus credenciales.${NC}"
    exit 1
fi

echo -e "Configuración de AWS detectada."

# Si existe un archivo .env.production, leerlo
env_file=".env.production"
bucket_name="frontend-bedrock-agent-dove" # Valor por defecto

if [ -f "$env_file" ]; then
    echo -e "Archivo .env.production detectado."
    
    # En producción, el nombre del bucket debería venir de Terraform
    # Aquí usamos un valor por defecto para pruebas manuales
else
    echo -e "${YELLOW}Advertencia: No se encontró archivo .env.production. Usando valores por defecto.${NC}"
    
    # Creamos un archivo .env.production básico
    echo "VITE_API_URL=https://tu-api-gateway-url/dev/agent" > "$env_file"
    echo -e "${YELLOW}Se ha creado un archivo .env.production con valores de ejemplo.${NC}"
fi

# Instalar dependencias
echo -e "${CYAN}Instalando dependencias...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudieron instalar las dependencias.${NC}"
    exit 1
fi

# Compilar la aplicación
echo -e "${CYAN}Compilando la aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo compilar la aplicación.${NC}"
    exit 1
fi

# Desplegar en S3
echo -e "${CYAN}Desplegando en S3...${NC}"
aws s3 sync dist/ s3://$bucket_name --delete

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo desplegar en S3.${NC}"
    exit 1
fi

echo -e "${GREEN}¡Despliegue completado con éxito!${NC}"
echo -e "${GREEN}La aplicación está disponible en: http://$bucket_name.s3-website-us-east-1.amazonaws.com${NC}" 