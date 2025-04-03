# AWS Backend con Agente de Bedrock y RAG

## Descripción General

Este repositorio contiene una implementación completa de un backend basado en AWS que utiliza Amazon Bedrock para crear un agente conversacional con capacidades RAG (Retrieval Augmented Generation). La solución permite desplegar rápidamente un agente inteligente accesible a través de una API REST.

## Arquitectura

```
                     ┌───────────────┐                  
    ┌─────────────┐  │               │    ┌─────────────────┐
    │             │  │  API Gateway  │    │                 │
    │   Cliente   │──►               │───►│  AWS Lambda     │
    │             │  │   (HTTP)      │    │                 │
    └─────────────┘  │               │    └────────┬────────┘
                     └───────────────┘             │
                                                   │
                                                   ▼
                     ┌───────────────┐    ┌─────────────────┐
                     │               │    │                 │
                     │  Amazon S3    │    │  Amazon Bedrock │
                     │               │    │    (Agente)     │
                     └───────┬───────┘    └────────┬────────┘
                             │                     │
                             │                     ▼
                             ▼               ┌─────────────────┐
                     ┌───────────────┐      │  Base de Datos  │
                     │   IAM Roles   │      │  Conocimiento  *│
                     │  & Políticas  │      │  (PostgreSQL)   │
                     │               │      └─────────────────┘
                     └───────────────┘    
                             │
                             ▼
                     ┌───────────────┐
                     │  Frontend UI  │ (Opcional)
                     │ (React en S3) │
                     └───────────────┘

* La Base de Datos de Conocimiento debe configurarse manualmente y no es parte del despliegue automático
```

La arquitectura del proyecto incluye:

- **Amazon Bedrock**: Servicio de IA/ML que proporciona acceso a modelos de lenguaje de fundación (LLM).
- **API Gateway**: Proporciona un endpoint HTTPS para interactuar con el agente.
- **AWS Lambda**: Procesa las solicitudes y gestiona la comunicación con el agente Bedrock.
- **Roles IAM**: Gestionan los permisos y accesos entre servicios.
- **S3**: Almacena archivos y datos necesarios para el funcionamiento del sistema.
- **Frontend React**: Interfaz de usuario para interactuar con el agente (opcional).
- **Base de Datos de Conocimiento**: Para la capacidad RAG (Retrieval Augmented Generation). Este componente no se despliega automáticamente y debe configurarse manualmente.

## Estructura del Repositorio

```
aws-backend-rag-basic/
├── agent-py-demo-ai/       # Código de la función Lambda
│   ├── main.py             # Punto de entrada de la Lambda
│   └── README.md           # Documentación específica de la Lambda
│
├── agent-react-app/        # Aplicación frontend en React
│   ├── src/                # Código fuente React
│   └── README.md           # Documentación del frontend
│
├── tf-deploy-rag-basic/    # Configuración de Terraform
│   ├── main.tf             # Recursos principales
│   ├── data.tf             # Datos y políticas
│   ├── variables.tf        # Definición de variables
│   └── README.md           # Documentación específica de Terraform
│
├── .gitignore              # Archivos excluidos del control de versiones
└── README.md               # Este archivo
```

## Componentes Principales

### 1. Terraform (tf-deploy-rag-basic/)

La carpeta `tf-deploy-rag-basic` contiene la configuración de Terraform para desplegar todos los recursos necesarios en AWS, incluyendo:

- Agente de Amazon Bedrock
- Función Lambda
- API Gateway HTTP
- Roles y políticas IAM necesarios
- Bucket S3
- Frontend React (opcional)

Para más detalles, consulta el [README de Terraform](./tf-deploy-rag-basic/README.md).

### 2. Función Lambda (agent-py-demo-ai/)

La carpeta `agent-py-demo-ai` contiene el código Python para la función Lambda que sirve como intermediario entre la API Gateway y el agente de Bedrock. Esta Lambda:

- Recibe solicitudes HTTP
- Procesa el texto de entrada
- Invoca al agente de Bedrock
- Devuelve la respuesta generada por el agente

Para más detalles, consulta el [README de la Lambda](./agent-py-demo-ai/README.md).

### 3. Frontend React (agent-react-app/)

La carpeta `agent-react-app` contiene una aplicación web desarrollada en React que proporciona una interfaz de usuario para interactuar con el agente a través de la API.

- Interfaz de chat moderna y adaptable
- Manejo de errores y estado de carga
- Despliegue opcional mediante Terraform o manualmente en S3

Para más detalles, consulta el [README del Frontend](./agent-react-app/README.md).

### 4. Base de Conocimiento (configuración manual)

La base de conocimiento para RAG (Retrieval Augmented Generation) no se incluye en el despliegue automático y debe configurarse manualmente:

- Se recomienda utilizar Aurora PostgreSQL Serverless para un rendimiento óptimo
- Debe configurarse después del despliegue inicial de la infraestructura
- Se conecta al agente de Bedrock para proporcionar contexto adicional a las respuestas
- Requiere configuración adicional en la consola de Amazon Bedrock

Consulta la sección específica en el [README de Terraform](./tf-deploy-rag-basic/README.md#base-de-datos-de-conocimiento) para obtener instrucciones detalladas sobre cómo configurar esta base de conocimiento manualmente.

## Opciones de Despliegue

Este proyecto ofrece dos modos de despliegue principales:

### 1. Despliegue Completo (Backend + Frontend)

Incluye todos los componentes:
- Agente Bedrock y API Gateway (backend)
- Interfaz de usuario React alojada en S3 (frontend)

### 2. Despliegue Solo Backend

Incluye solamente los componentes del backend:
- Agente Bedrock, Lambda y API Gateway
- Sin interfaz de usuario

Para controlar el tipo de despliegue, use la variable `deploy_ui` en Terraform.

## Requisitos Previos

Para utilizar este proyecto, necesitarás:

- Cuenta de AWS con acceso a Amazon Bedrock
- AWS CLI configurado con credenciales válidas
- Terraform 1.0.0+
- Python 3.13+ (para desarrollo local)
- Node.js 18+ y npm (solo si se despliega el frontend)

## Guía Rápida

### En macOS/Linux:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tuusuario/aws-backend-rag-basic.git
   cd aws-backend-rag-basic
   ```

2. **Desplegar la infraestructura**:
   ```bash
   cd tf-deploy-rag-basic
   terraform init
   terraform apply -var-file="terraform.tfvars"
   ```

   Para desplegar solo el backend:
   ```bash
   terraform apply -var-file="terraform.tfvars" -var="deploy_ui=false"
   ```

3. **Probar el endpoint**:
   ```bash
   curl -X POST https://tu-api-gateway-url/dev/agent \
     -H "Content-Type: application/json" \
     -d '{"prompt": "¿Qué servicios ofrece AWS para IA?"}'
   ```

4. **Desplegar el frontend manualmente** (opcional, si no se desplegó automáticamente):
   ```bash
   cd ../agent-react-app
   API_URL=$(cd ../tf-deploy-rag-basic && terraform output -raw api_gateway_url)
   echo "VITE_API_URL=$API_URL" > .env.production
   npm install
   npm run build
   aws s3 sync dist/ s3://$(cd ../tf-deploy-rag-basic && terraform output -raw frontend_bucket_name) --delete
   ```

### En Windows:

1. **Clonar el repositorio** (en PowerShell):
   ```powershell
   git clone https://github.com/tuusuario/aws-backend-rag-basic.git
   cd aws-backend-rag-basic
   ```

2. **Desplegar la infraestructura**:
   ```powershell
   cd tf-deploy-rag-basic
   terraform init
   terraform apply -var-file="terraform.tfvars"
   ```

   Para desplegar solo el backend:
   ```powershell
   terraform apply -var-file="terraform.tfvars" -var="deploy_ui=false"
   ```

3. **Probar el endpoint**:
   ```powershell
   $headers = @{
       "Content-Type" = "application/json"
   }
   $body = @{
       "prompt" = "¿Qué servicios ofrece AWS para IA?"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "https://tu-api-gateway-url/dev/agent" -Method Post -Headers $headers -Body $body
   ```

4. **Desplegar el frontend manualmente** (opcional, si no se desplegó automáticamente):
   ```powershell
   cd ..\agent-react-app
   $apiUrl = (cd ..\tf-deploy-rag-basic; terraform output -raw api_gateway_url)
   Set-Content -Path .env.production -Value "VITE_API_URL=$apiUrl"
   npm install
   npm run build
   $bucketName = (cd ..\tf-deploy-rag-basic; terraform output -raw frontend_bucket_name)
   aws s3 sync dist/ s3://$bucketName --delete
   ```

## Solución de Problemas Comunes

### En Windows

- **Error al ejecutar comandos en PowerShell**: Ajusta la política de ejecución:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

- **Terraform no reconocido**: Asegúrate de que Terraform esté en el PATH de Windows.

- **Problemas de codificación en PowerShell**: Si tienes problemas con caracteres especiales, usa UTF-8:
  ```powershell
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  ```

### En macOS/Linux

- **AWS CLI no configurado**: Asegúrate de que AWS CLI está configurado:
  ```bash
  aws configure
  ```

### General

- **Error "Not authorized to use Bedrock"**: Asegúrate de que tu cuenta tiene acceso habilitado a Amazon Bedrock.
  
- **Timeouts de la API**: Los modelos grandes pueden tardar en generar respuestas. Aumenta los tiempos de espera en la configuración.

## Personalización

El proyecto es altamente personalizable:

- **Modelo de IA**: Puedes cambiar el modelo de Bedrock utilizado.
- **Instrucciones**: Modifica las instrucciones del agente para adaptarlo a diferentes casos de uso.
- **Lambda**: Extiende la función Lambda para incluir lógica de negocio adicional.
- **Base de conocimiento**: Configura diferentes fuentes de datos para el RAG.
- **Despliegue**: Elige si desplegar la interfaz de usuario o solo el backend.

## Licencia

[MIT](https://opensource.org/licenses/MIT)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios antes de enviar un pull request.