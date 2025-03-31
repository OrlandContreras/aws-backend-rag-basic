# AWS Backend con Agente de Bedrock y RAG

## Descripción General

Este repositorio contiene una implementación completa de un backend basado en AWS que utiliza Amazon Bedrock para crear un agente conversacional con capacidades RAG (Retrieval Augmented Generation). La solución permite desplegar rápidamente un agente inteligente accesible a través de una API REST.

## Arquitectura

![Arquitectura](https://miro.medium.com/v2/resize:fit:1400/1*vx3OEQpRyHZ-EQUKlU2XEA.png)

La arquitectura del proyecto incluye:

- **Amazon Bedrock**: Servicio de IA/ML que proporciona acceso a modelos de lenguaje de fundación (LLM).
- **API Gateway**: Proporciona un endpoint HTTPS para interactuar con el agente.
- **AWS Lambda**: Procesa las solicitudes y gestiona la comunicación con el agente Bedrock.
- **Roles IAM**: Gestionan los permisos y accesos entre servicios.
- **S3**: Almacena archivos y datos necesarios para el funcionamiento del sistema.

## Estructura del Repositorio

```
aws-backend-rag-basic/
├── agent-py-demo-ai/       # Código de la función Lambda
│   ├── main.py             # Punto de entrada de la Lambda
│   └── README.md           # Documentación específica de la Lambda
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

Para más detalles, consulta el [README de Terraform](./tf-deploy-rag-basic/README.md).

### 2. Función Lambda (agent-py-demo-ai/)

La carpeta `agent-py-demo-ai` contiene el código Python para la función Lambda que sirve como intermediario entre la API Gateway y el agente de Bedrock. Esta Lambda:

- Recibe solicitudes HTTP
- Procesa el texto de entrada
- Invoca al agente de Bedrock
- Devuelve la respuesta generada por el agente

Para más detalles, consulta el [README de la Lambda](./agent-py-demo-ai/README.md).

## Requisitos Previos

Para utilizar este proyecto, necesitarás:

- Cuenta de AWS con acceso a Amazon Bedrock
- AWS CLI configurado con credenciales válidas
- Terraform 1.0.0+
- Python 3.13+ (para desarrollo local)

## Guía Rápida

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

3. **Probar el endpoint**:
   ```bash
   curl -X POST https://tu-api-gateway-url/prod/agent \
     -H "Content-Type: application/json" \
     -d '{"prompt": "¿Qué servicios ofrece AWS para IA?"}'
   ```

## Base de Conocimiento

La base de conocimiento para el agente debe configurarse manualmente. Se recomienda utilizar Aurora PostgreSQL Serverless para obtener un rendimiento óptimo. Consulta la sección específica en el [README de Terraform](./tf-deploy-rag-basic/README.md#base-de-datos-de-conocimiento) para más detalles.

## Personalización

El proyecto es altamente personalizable:

- **Modelo de IA**: Puedes cambiar el modelo de Bedrock utilizado.
- **Instrucciones**: Modifica las instrucciones del agente para adaptarlo a diferentes casos de uso.
- **Lambda**: Extiende la función Lambda para incluir lógica de negocio adicional.
- **Base de conocimiento**: Configura diferentes fuentes de datos para el RAG.

## Licencia

[MIT](https://opensource.org/licenses/MIT)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios antes de enviar un pull request. 