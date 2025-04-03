# Aplicación React para Agente de Amazon Bedrock

Esta aplicación proporciona una interfaz de usuario para interactuar con un agente de Amazon Bedrock a través de una API REST.

## Características

- Interfaz de chat moderna y amigable
- Comunicación en tiempo real con el agente de IA
- Diseño adaptable para dispositivos móviles y de escritorio
- Manejo de errores y estado de carga
- Historial de mensajes persistente
- Botón para iniciar nuevas conversaciones
- Mensaje de bienvenida automático al iniciar el chat
- Soporte para respuestas basadas en conocimiento (RAG)

## Estructura del Proyecto

El proyecto sigue una estructura típica de una aplicación React con Vite:

```
agent-react-app/
├── public/           # Archivos estáticos
├── src/              # Código fuente
│   ├── components/   # Componentes reutilizables
│   ├── hooks/        # Hooks personalizados
│   ├── services/     # Servicios para API
│   ├── types/        # Definiciones de tipos TypeScript
│   ├── lib/          # Utilidades generales
│   ├── main.tsx      # Punto de entrada principal
│   └── App.tsx       # Componente raíz
├── dist/             # Archivos de distribución (generados en la compilación)
└── package.json      # Dependencias y scripts
```

## Tecnologías Utilizadas

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- AWS SDK para JavaScript

## Requisitos Previos

- Node.js 18.0.0 o superior
- npm 9.0.0 o superior
- AWS CLI configurado con credenciales válidas

## Configuración

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd aws-backend-rag-basic/agent-react-app
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env.development` para desarrollo local
   - Crea un archivo `.env.production` para producción
   
   Ejemplo:
   ```
   VITE_API_URL=https://tu-api-gateway-url/dev/agent
   ```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Compilación

Para compilar la aplicación para producción:

```bash
npm run build
```

Esto generará los archivos estáticos en el directorio `dist/`.

## Despliegue

### Opción 1: Despliegue Automatizado con Terraform

El despliegue se realiza automáticamente como parte del proceso de Terraform desde el directorio `tf-deploy-rag-basic` cuando la opción `deploy_ui = true` está configurada:

```bash
cd ../tf-deploy-rag-basic
terraform apply -var-file="terraform.tfvars"
```

Para desplegar solo el backend sin la interfaz de usuario:
```bash
terraform apply -var-file="terraform.tfvars" -var="deploy_ui=false"
```

### Opción 2: Despliegue Manual

Si has configurado `deploy_ui = false` en Terraform o necesitas realizar un despliegue manual del frontend, sigue estos pasos:

#### Preparación:

1. Asegúrate de tener AWS CLI instalado y configurado correctamente:
   ```
   aws --version
   aws configure list
   ```

2. Identifica el nombre del bucket S3 donde desplegarás el frontend. Si has usado Terraform para desplegar el backend, puedes obtener el nombre del bucket con:
   ```
   cd ../tf-deploy-rag-basic
   terraform output frontend_bucket_name
   ```

#### Pasos para el despliegue manual:

1. Configura la URL de la API en el archivo .env.production:
   ```bash
   cd ../agent-react-app
   API_URL=$(cd ../tf-deploy-rag-basic && terraform output -raw api_gateway_url)
   echo "VITE_API_URL=$API_URL" > .env.production
   ```

2. Instala las dependencias (si aún no están instaladas):
   ```bash
   npm install
   ```

3. Compila la aplicación:
   ```bash
   npm run build
   ```

4. Despliega a S3 (reemplaza "nombre-del-bucket" con el nombre real del bucket):
   ```bash
   aws s3 sync dist/ s3://nombre-del-bucket --delete
   ```

### Verificación del Despliegue

Después de desplegar, puedes acceder a tu aplicación en:
```
http://nombre-del-bucket.s3-website-us-east-1.amazonaws.com
```

O a través de la URL proporcionada por Terraform:
```bash
cd ../tf-deploy-rag-basic
terraform output frontend_website_url
```

## Interacción con la Base de Conocimiento

Esta interfaz está diseñada para interactuar con un agente Bedrock que puede utilizar una base de conocimiento (Knowledge Base) para responder preguntas utilizando la técnica RAG (Recuperación Aumentada de Generación).

**Importante**: La base de conocimiento **no** se despliega automáticamente con Terraform y debe configurarse manualmente en la consola de Amazon Bedrock antes de poder utilizarla. La interfaz de usuario solo interactúa con el agente, que a su vez consulta la base de conocimiento si ha sido configurada.

Para más detalles sobre cómo configurar la base de conocimiento manualmente, consulta la sección específica en el [README de Terraform](../tf-deploy-rag-basic/README.md#base-de-datos-de-conocimiento).

## Resolución de Problemas

### Problemas con el entorno de desarrollo
- **Node.js o npm no encontrados**: Asegúrate de que Node.js (versión 18 o superior) esté instalado correctamente y agregado al PATH del sistema.
- **Errores al instalar dependencias**: Intenta ejecutar `npm cache clean --force` y luego vuelve a instalar las dependencias.
- **Problemas con los permisos de archivos**: Asegúrate de que tienes permisos de escritura en el directorio del proyecto.

### Problemas con Vite y la compilación
- **Errores durante la compilación**: Verifica que el archivo `.env.production` contenga la URL correcta del API Gateway.
- **Variables de entorno no disponibles**: Asegúrate de que los nombres de las variables comienzan con `VITE_` para que sean expuestas a la aplicación.
- **Advertencias de TypeScript**: Si aparecen errores o advertencias de tipado, ejecuta `npm run typecheck` para identificar problemas específicos.

### Problemas de despliegue en S3
- **Error "Access Denied" al subir archivos**: Verifica que:
  1. El bucket S3 existe y tienes permisos para escribir en él
  2. Tu usuario de AWS tiene los permisos adecuados (`s3:PutObject` y otros necesarios)
  3. Las configuraciones de acceso público del bucket permiten el despliegue

- **Sitio web no accesible después del despliegue**: Asegúrate de que:
  1. El bucket tiene la configuración de sitio web estático habilitada
  2. La política del bucket permite el acceso público a los objetos
  3. La configuración CORS está correctamente establecida

### Problemas de comunicación con el backend
- **Error de CORS**: Si ves errores de CORS en la consola del navegador, verifica que el API Gateway tenga configurados correctamente los encabezados CORS.
- **Tiempo de respuesta excesivo**: El primer acceso al agente puede ser lento debido al "cold start" de la función Lambda. Las solicitudes posteriores deberían ser más rápidas.
- **Error de conexión**: Verifica que la URL del API Gateway en `.env.production` sea correcta y que el API Gateway esté desplegado y accesible.

### Problemas con la base de conocimiento
- **El agente no proporciona respuestas basadas en conocimiento**: Verifica que:
  1. La base de conocimiento se haya configurado correctamente en la consola de Amazon Bedrock
  2. El agente tenga acceso y esté configurado para usar la base de conocimiento
  3. Los datos ingresados en la base de conocimiento sean relevantes para las consultas realizadas
  4. Los logs del agente en la consola de Bedrock no muestren errores al consultar la base de conocimiento

## Licencia

MIT
