# Lambda de Integración con Amazon Bedrock Agent

## Descripción
Esta función Lambda sirve como intermediario entre una API REST y un agente de Amazon Bedrock. Permite invocar un agente de Bedrock a través de una interfaz HTTP, facilitando su integración en aplicaciones web, móviles u otros sistemas.

## Características
- Procesamiento de solicitudes HTTP a través de API Gateway
- Invocación de agentes de Amazon Bedrock
- Manejo de streaming de respuestas
- Gestión de errores robusta
- Fácil despliegue mediante Terraform
- Integración con bases de conocimiento RAG (configuradas manualmente)

## Requisitos
- Python 3.13 o superior
- AWS Lambda
- Amazon Bedrock con un agente configurado
- Permisos IAM para `bedrock:InvokeAgent`
- Boto3 (incluido en el entorno Lambda)
- Base de datos de conocimiento configurada manualmente (para capacidades RAG)

## Variables de Entorno
La función requiere las siguientes variables de entorno:

| Variable | Descripción |
|----------|-------------|
| `BEDROCK_AGENT_ID` | ID del agente de Bedrock a invocar |
| `BEDROCK_AGENT_ALIAS_ID` | ID del alias del agente de Bedrock |

Estas variables se configuran automáticamente durante el despliegue con Terraform.

## Estructura de Archivos
```
.
├── main.py         # Punto de entrada de la Lambda
├── requirements.txt # Dependencias de Python
└── README.md       # Este archivo
```

## Formato de Solicitud
La Lambda acepta solicitudes con el siguiente formato JSON:

```json
{
  "prompt": "¿Cuál es tu pregunta para el agente?"
}
```

Este formato puede enviarse directamente a la Lambda o a través del API Gateway.

### Ejemplo con curl:
```bash
curl -X POST https://tu-api-gateway-url/prod/agent \
  -H "Content-Type: application/json" \
  -d '{"prompt": "¿Qué servicios ofrece AWS para IA?"}'
```

## Formato de Respuesta
La Lambda devuelve respuestas con el siguiente formato:

```json
{
  "message": "Respuesta del agente de Bedrock..."
}
```

En caso de error:
```json
{
  "error": "Descripción del error"
}
```

## Despliegue
Esta Lambda está diseñada para ser desplegada mediante Terraform como parte de una infraestructura más amplia que incluye:

1. La función Lambda
2. Un API Gateway HTTP
3. Un agente de Amazon Bedrock
4. Las políticas IAM necesarias

Consulta el archivo `tf-deploy-rag-basic/main.tf` para ver la configuración completa.

Si necesitas desplegar o actualizar manualmente el frontend de la aplicación, consulta las instrucciones en el [README del proyecto de frontend](../agent-react-app/README.md#despliegue).

## Base de Conocimiento (RAG)
Esta Lambda está diseñada para trabajar con un agente de Bedrock que puede utilizar una base de conocimiento para proporcionar respuestas más precisas y contextuales (Recuperación Aumentada de Generación o RAG).

**Importante**: La base de conocimiento **no** se despliega automáticamente con Terraform y debe configurarse manualmente. Después de desplegar toda la infraestructura, sigue estos pasos generales:

1. Crea una base de datos compatible (recomendado Aurora PostgreSQL Serverless)
2. Configura la base de conocimiento en la consola de Amazon Bedrock
3. Sube los documentos o datos que deseas incluir en tu base de conocimiento
4. Configura el agente de Bedrock para usar esta base de conocimiento

Para más detalles sobre la configuración manual de la base de conocimiento, consulta la sección específica en el [README de Terraform](../tf-deploy-rag-basic/README.md#base-de-datos-de-conocimiento).

## Mejoras Futuras
- Implementar manejo dinámico de sesiones
- Añadir autenticación para las solicitudes
- Permitir configuración de parámetros adicionales para la invocación del agente
- Implementar caché para respuestas frecuentes

## Solución de Problemas

### Problemas con la función Lambda
- **Error 500 al invocar la función**: Verifica los logs en CloudWatch para identificar el origen del error.
- **Timeout en la respuesta**: Puede ser debido a que la configuración de timeout de la Lambda es insuficiente para el procesamiento del agente. Considera aumentar el timeout en la configuración de Terraform.
- **Errores de memoria**: Si la Lambda se queda sin memoria, aumenta la asignación de memoria en la configuración de Terraform.

### Problemas con la invocación del agente
- **Error "AccessDeniedException"**: Verifica que la función Lambda tenga los permisos IAM adecuados para invocar al agente Bedrock.
- **Error "ValidationException"**: Comprueba que el formato de entrada cumple con los requisitos del agente.
- **Error "ResourceNotFoundException"**: Confirma que el ID del agente y el ID del alias son correctos en las variables de entorno.
- **Error "ServiceQuotaExceededException"**: Puede ser necesario solicitar un aumento de cuota para Amazon Bedrock.

### Problemas con la base de conocimiento
- **El agente no utiliza la base de conocimiento**: Verifica que:
  1. La base de conocimiento esté correctamente configurada en la consola de Amazon Bedrock
  2. El agente tenga los permisos necesarios para acceder a la base de conocimiento
  3. La consulta sea relevante para los datos almacenados en la base de conocimiento
  4. Los logs del agente en CloudWatch no muestren errores relacionados con la base de conocimiento

### Problemas de integración con API Gateway
- **Error de CORS**: Comprueba que la configuración CORS del API Gateway sea correcta, especialmente si tienes un frontend que se comunica con esta API.
- **Errores 4xx o 5xx**: Revisa los logs en CloudWatch para identificar si el error ocurre en la Lambda o en el API Gateway.
- **Problema con el formato de respuesta**: Asegúrate de que la función Lambda devuelve el formato de respuesta esperado por el cliente.

Para cualquier otro error, revisa los logs detallados en CloudWatch. Estos logs proporcionarán información más específica sobre el origen del problema.
