# Despliegue de Agente Amazon Bedrock con Terraform

## Descripción
Este proyecto contiene la configuración de Terraform para desplegar un agente de Amazon Bedrock junto con toda la infraestructura necesaria para su funcionamiento e integración con aplicaciones externas a través de API Gateway y Lambda.

## Arquitectura

La infraestructura desplegada incluye los siguientes componentes:

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│                │    │                │    │                │
│  API Gateway   │───▶│     Lambda     │───▶│ Bedrock Agent  │
│                │    │                │    │                │
└────────────────┘    └────────────────┘    └────────────────┘
                             │                      │
                             │                      │
                             │                      ▼
                      ┌──────▼───────┐    ┌─────────────────────┐
                      │              │    │                     │
                      │   IAM Roles  │    │  Base de Datos de   │
                      │              │    │  Conocimiento      *│
                      └──────────────┘    └─────────────────────┘
                             │
                             │
                      ┌──────▼───────┐
                      │              │
                      │  S3 Bucket   │
                      │              │
                      └──────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │     Frontend UI     │ (Opcional)
                  │  (React en S3)      │
                  └─────────────────────┘

* La Base de Datos de Conocimiento debe configurarse manualmente y no es parte del despliegue automático de Terraform
```

## Recursos Desplegados

### Desplegados automáticamente por Terraform:
- **Random Pet**: Genera un sufijo aleatorio para garantizar nombres únicos en los recursos.
- **IAM Roles y Políticas**: Para el agente de Bedrock y la función Lambda.
- **S3 Bucket**: Para almacenar archivos relacionados con la aplicación.
- **Bedrock Agent**: Configuración del agente con el modelo especificado.
- **Bedrock Agent Alias**: Alias requerido para invocar el agente.
- **Lambda Function**: Código Python que sirve como intermediario para invocar el agente.
- **Lambda Function URL**: URL directa para invocar la Lambda (opcional).
- **API Gateway HTTP API**: API REST para exponer la función Lambda externamente.
- **API Gateway Routes e Integration**: Configuración para conectar la API con la Lambda.
- **S3 Website Hosting**: Configuración de alojamiento web estático para el frontend (opcional).

### Recursos que requieren configuración manual:
- **Base de Datos de Conocimiento**: La base de conocimiento para el agente Bedrock (Knowledge Base) no está incluida en este despliegue de Terraform y debe configurarse manualmente después del despliegue. Se recomienda utilizar Aurora PostgreSQL Serverless para esta función. Consulte la sección "Base de Datos de Conocimiento" más adelante para más detalles.

## Requisitos Previos

- [Terraform](https://www.terraform.io/downloads.html) instalado (v1.0.0+)
- [AWS CLI](https://aws.amazon.com/cli/) instalado y configurado
- Acceso a AWS con permisos para crear todos los recursos mencionados
- Acceso habilitado a Amazon Bedrock y los modelos requeridos en tu cuenta
- Node.js y npm (solo si se despliega la interfaz de usuario)

## Permisos de AWS Requeridos

Para ejecutar este despliegue de Terraform, el usuario de AWS debe tener permisos suficientes para crear y administrar todos los recursos involucrados. Se recomienda una de las siguientes opciones:

### Opción 1: Usuario con permisos administrativos (para desarrollo)
- Política administrada: `AdministratorAccess`

### Opción 2: Permisos específicos (recomendado para producción)
El usuario necesita los siguientes permisos específicos:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:PutBucketPolicy",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:DeleteBucket"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:GetRole",
                "iam:PassRole",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRolePolicy",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:TagRole"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:GetFunction",
                "lambda:DeleteFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:InvokeFunction",
                "lambda:AddPermission",
                "lambda:RemovePermission",
                "lambda:GetPolicy",
                "lambda:CreateFunctionUrlConfig",
                "lambda:GetFunctionUrlConfig",
                "lambda:DeleteFunctionUrlConfig"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DeleteLogGroup"
            ],
            "Resource": "*"
        }
    ]
}
```

### Notas importantes:
- Para entornos de producción, es recomendable restringir los recursos ("Resource") a los ARNs específicos en lugar de usar "*".
- Es posible que se requieran permisos adicionales dependiendo de las personalizaciones realizadas.
- Para usar Bedrock, la cuenta debe tener acceso habilitado a este servicio y a los modelos específicos.

## Variables de Entrada

Este despliegue requiere las siguientes variables:

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `region` | La región de AWS donde se desplegarán los recursos | `us-east-1` | Sí |
| `foundation_model` | El ID del modelo de Bedrock a utilizar | `anthropic.claude-3-sonnet-20240229-v1:0` | Sí |
| `agent_name` | El nombre base para el agente | `my-bedrock-agent` | Sí |
| `instruction` | Las instrucciones para el agente de Bedrock | `Eres un asistente...` | Sí |
| `bucket_name` | El nombre base para el bucket S3 | `bedrock-agent-files` | Sí |
| `deploy_ui` | Controla si se despliega la interfaz de usuario web (true) o solo el backend (false) | `true` o `false` | No (por defecto: `true`) |

## Opciones de Despliegue

Este proyecto ofrece dos modos de despliegue:

### 1. Despliegue Completo (Backend + Frontend)

Si `deploy_ui = true` (valor predeterminado), se desplegará:
- Toda la infraestructura del backend (Agente Bedrock, Lambda, API Gateway)
- La interfaz de usuario React alojada en S3
- Configuración de CORS en el API Gateway para permitir solicitudes desde el frontend

Este modo es ideal para:
- Desarrollo y pruebas de la solución completa
- Implementaciones que requieren una interfaz de usuario web

### 2. Despliegue Solo Backend

Si `deploy_ui = false`, se desplegará:
- Solo la infraestructura del backend (Agente Bedrock, Lambda, API Gateway)
- Sin interfaz de usuario
- API Gateway sin configuración CORS completa

Este modo es ideal para:
- Integración con aplicaciones existentes
- Uso como API headless
- Entornos donde la interfaz de usuario se gestiona por separado
- Reducción de costos al eliminar recursos innecesarios

### Despliegue Manual del Frontend

Si has elegido la opción `deploy_ui = false` o has encontrado problemas con el despliegue automático del frontend, puedes desplegarlo manualmente siguiendo estos pasos:

1. Obtén el nombre del bucket y la URL del API Gateway:
   ```bash
   terraform output frontend_bucket_name
   terraform output api_gateway_url
   ```

2. Sigue las instrucciones detalladas en el [README del frontend](../agent-react-app/README.md#opción-2-despliegue-manual) para desplegar manualmente la aplicación React.

3. Este enfoque es útil cuando:
   - Trabajas en entornos con políticas de ejecución restrictivas
   - Quieres personalizar el frontend antes de desplegarlo
   - Necesitas más control sobre el proceso de despliegue

## Uso

### Inicialización

```bash
cd tf-deploy-rag-basic
terraform init
```

### Plan de Ejecución

```bash
terraform plan -var-file="terraform.tfvars"
```

### Aplicación

Para desplegar todo (backend + frontend):
```bash
terraform apply -var-file="terraform.tfvars" -auto-approve
```

Para desplegar solo el backend:
```bash
terraform apply -var-file="terraform.tfvars" -var="deploy_ui=false" -auto-approve
```

### Verificación del Despliegue

Después del despliegue, puedes obtener información importante con:

```bash
# Obtener todas las salidas
terraform output

# Obtener la URL de la API Gateway
terraform output api_gateway_url

# Obtener el nombre del bucket para el frontend (si deploy_ui = true)
terraform output frontend_bucket_name

# Obtener la URL del sitio web frontend (si deploy_ui = true)
terraform output frontend_website_url
```

Si utilizas la opción `deploy_ui=true`, verás instrucciones en la consola para el despliegue manual del frontend. Estas instrucciones incluirán los comandos específicos para tu entorno (Windows o Unix) y mostrarán el nombre del bucket S3 donde debe desplegarse el frontend.

### Ejemplo de archivo terraform.tfvars

```hcl
region = "us-east-1"
foundation_model = "anthropic.claude-3-sonnet-20240229-v1:0"
agent_name = "demo-agent"
instruction = "Eres un asistente experto en AWS que responde preguntas sobre servicios de AWS."
bucket_name = "bedrock-agent-demo"
deploy_ui = true  # Establecer a false para desplegar solo el backend
```

## Salidas

Después del despliegue, Terraform producirá las siguientes salidas:

| Output | Descripción |
|--------|-------------|
| `api_gateway_url` | URL del API Gateway para invocar el agente |
| `lambda_function_url` | URL directa de la función Lambda |
| `agent_id` | ID del agente Bedrock creado |
| `agent_alias_id` | ID del alias del agente Bedrock |
| `frontend_website_url` | URL del sitio web del frontend (si `deploy_ui = true`) |
| `frontend_bucket_name` | Nombre del bucket S3 donde se debe desplegar el frontend (si `deploy_ui = true`) |
| `ui_deployed` | Indica si la interfaz de usuario ha sido desplegada |

## Limpieza

Para eliminar todos los recursos desplegados:

```bash
terraform destroy -var-file="terraform.tfvars" -auto-approve
```

## Estructura de Archivos

```
tf-deploy-rag-basic/
├── main.tf           # Definición principal de recursos
├── variables.tf      # Declaración de variables
├── data.tf           # Fuentes de datos y definiciones de políticas
├── outputs.tf        # Definiciones de salida (opcional)
├── terraform.tfvars  # Valores de las variables (no incluido en el repo)
└── README.md         # Este archivo
```

## Personalización

Para personalizar este despliegue:

1. Modifica las variables en tu archivo `terraform.tfvars`
2. Ajusta las políticas IAM en `data.tf` si necesitas permisos adicionales
3. Modifica la configuración del agente o Lambda en `main.tf`

## Base de Datos de Conocimiento

La base de datos de conocimiento para el agente Bedrock debe generarse de manera manual, ya que no está incluida en esta configuración de Terraform. Para obtener el mejor rendimiento y escalabilidad, se recomienda:

- **Aurora PostgreSQL Serverless**: Proporciona capacidad bajo demanda que se escala automáticamente según las necesidades, ideal para cargas de trabajo variables.
- Ventajas:
  - Escalado automático sin administración de capacidad
  - Facturación por segundo
  - Alta disponibilidad integrada
  - Compatible con PostgreSQL

### Pasos generales para configurar:

1. Crear un clúster de Aurora PostgreSQL Serverless en la consola de AWS o mediante la AWS CLI
2. Configurar los parámetros adecuados para conectividad
3. Crear las tablas y esquemas necesarios para la base de conocimiento
4. Configurar el agente Bedrock para utilizar esta base de datos como fuente de conocimiento

Para más información, consulte la [documentación de Amazon Aurora Serverless](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless.html).

## Solución de Problemas

- **Error de permisos IAM**: Verifica que tu usuario de AWS tenga permisos suficientes
- **Error de límites de servicio**: Puede ser necesario solicitar un aumento de cuota para Bedrock
- **Error de región no soportada**: Confirma que la región seleccionada admite Bedrock y el modelo elegido

## Referencias

- [Documentación de Amazon Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Documentación de Terraform para AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Función Lambda asociada](../agent-py-demo-ai/README.md)
