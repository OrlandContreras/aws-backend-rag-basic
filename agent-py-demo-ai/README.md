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
Si encuentras errores durante la invocación:

1. Verifica que las variables de entorno estén correctamente configuradas
2. Confirma que la función Lambda tenga los permisos IAM adecuados
3. Asegúrate de que el agente de Bedrock esté correctamente configurado y activo
4. Revisa los logs en CloudWatch para obtener información detallada sobre cualquier error
5. Si usas RAG, comprueba que la base de conocimiento esté correctamente configurada y accesible por el agente
