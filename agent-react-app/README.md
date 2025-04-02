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

El despliegue se realiza automáticamente como parte del proceso de Terraform desde el directorio `tf-deploy-rag-basic`:

```bash
cd ../tf-deploy-rag-basic
terraform apply -var-file="terraform.tfvars"
```

Para desplegar solo el backend sin la interfaz de usuario:
```bash
terraform apply -var-file="terraform.tfvars" -var="deploy_ui=false"
```

### Opción 2: Despliegue Manual

Debido a las políticas de seguridad restrictivas en algunos entornos, especialmente en PowerShell, se recomienda seguir estos pasos para el despliegue manual:

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

#### Despliegue en PowerShell (para usuarios de Windows):

Para evitar problemas con las políticas de ejecución restrictivas, usa estos comandos individuales:

1. Configura la política de ejecución para la sesión actual (opcional):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
   ```

2. Actualiza el archivo .env.production con la URL del API:
   ```powershell
   $apiUrl = terraform output -raw api_gateway_url   # Debes estar en el directorio tf-deploy-rag-basic
   Set-Content -Path .env.production -Value "VITE_API_URL=$apiUrl"
   ```

3. Instala dependencias (si aún no están instaladas):
   ```powershell
   npm install
   ```

4. Compila la aplicación:
   ```powershell
   npm run build
   ```

5. Despliega a S3 (reemplaza "nombre-del-bucket" con el nombre real del bucket):
   ```powershell
   aws s3 sync dist/ s3://nombre-del-bucket --delete
   ```

#### Despliegue en Bash (para usuarios de Linux/macOS):

1. Actualiza el archivo .env.production con la URL del API:
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

Reemplaza `nombre-del-bucket` con el nombre real del bucket y `us-east-1` con tu región de AWS si es diferente.

## Interacción con la Base de Conocimiento

Esta interfaz está diseñada para interactuar con un agente Bedrock que puede utilizar una base de conocimiento (Knowledge Base) para responder preguntas utilizando la técnica RAG (Recuperación Aumentada de Generación).

**Importante**: La base de conocimiento **no** se despliega automáticamente con Terraform y debe configurarse manualmente en la consola de Amazon Bedrock antes de poder utilizarla. La interfaz de usuario solo interactúa con el agente, que a su vez consulta la base de conocimiento si ha sido configurada.

Para más detalles sobre cómo configurar la base de conocimiento manualmente, consulta la sección específica en el [README de Terraform](../tf-deploy-rag-basic/README.md#base-de-datos-de-conocimiento).

## Resolución de Problemas

### Problemas Comunes en Windows

- **Error de permisos en PowerShell**: Si encuentras problemas con las políticas de ejecución de PowerShell, puedes cambiarla temporalmente para la sesión actual:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

- **Error al usar npm en PowerShell**: En algunos entornos corporativos, el uso de npm está restringido. En estos casos, puedes intentar:
  - Solicitar permisos temporales de administrador
  - Usar una terminal alternativa como CMD
  - Configurar las políticas de ejecución a nivel de usuario si tienes permisos

- **AWS CLI no está en el PATH**: Asegúrate de que AWS CLI esté instalado y agregado al PATH del sistema.

### Problemas Comunes en Unix

- **Problemas con los permisos de archivos**: Si encuentras problemas de permisos, asegúrate de que tienes permisos de escritura en el directorio:
  ```bash
  chmod -R u+w .
  ```

- **Node.js o npm no encontrados**: Asegúrate de que Node.js esté instalado correctamente y que está en el PATH del sistema.

### Problemas de Despliegue en S3

- **Error "Access Denied" al subir archivos a S3**: Verifica que:
  1. El bucket S3 existe y tienes permisos para escribir en él
  2. Tu usuario de AWS tiene los permisos adecuados (s3:PutObject)
  3. Las configuraciones de acceso público del bucket permiten el despliegue

- **Sitio web no accesible después del despliegue**: Asegúrate de que:
  1. El bucket tiene la configuración de sitio web estático habilitada
  2. La política del bucket permite el acceso público a los objetos
  3. La ACL del bucket está configurada correctamente

### Problemas Relacionados con la Base de Conocimiento

Si el agente no proporciona respuestas basadas en tu base de conocimiento:

1. Verifica que la base de conocimiento se haya configurado correctamente en la consola de Amazon Bedrock.
2. Asegúrate de que el agente tiene acceso y esté configurado para usar la base de conocimiento.
3. Comprueba que los datos ingresados en la base de conocimiento sean relevantes para las consultas realizadas.
4. Revisa los registros del agente en la consola de Amazon Bedrock para diagnosticar problemas.

## Licencia

MIT
