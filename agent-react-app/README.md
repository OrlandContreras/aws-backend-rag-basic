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
├── deploy.sh         # Script de despliegue para Unix (Linux/macOS)
├── deploy.ps1        # Script de despliegue para Windows
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

#### En Windows:

Ejecuta el script PowerShell incluido:

```
.\deploy.ps1
```

Este script:
1. Verifica las dependencias (AWS CLI, Node.js)
2. Instala los paquetes npm
3. Compila la aplicación
4. Despliega los archivos a un bucket S3

#### En Linux/macOS:

Ejecuta el script Bash incluido:

```bash
./deploy.sh
```

Este script realiza las mismas operaciones que el script de Windows pero en entorno Unix.

#### Despliegue Manual Paso a Paso:

Si prefieres hacerlo manualmente:

1. Construye la aplicación:
   ```bash
   npm run build
   ```

2. Despliega a S3:
   ```bash
   aws s3 sync dist/ s3://nombre-de-tu-bucket --delete
   ```

## Interacción con la Base de Conocimiento

Esta interfaz está diseñada para interactuar con un agente Bedrock que puede utilizar una base de conocimiento (Knowledge Base) para responder preguntas utilizando la técnica RAG (Recuperación Aumentada de Generación).

**Importante**: La base de conocimiento **no** se despliega automáticamente con Terraform y debe configurarse manualmente en la consola de Amazon Bedrock antes de poder utilizarla. La interfaz de usuario solo interactúa con el agente, que a su vez consulta la base de conocimiento si ha sido configurada.

Para más detalles sobre cómo configurar la base de conocimiento manualmente, consulta la sección específica en el [README de Terraform](../tf-deploy-rag-basic/README.md#base-de-datos-de-conocimiento).

## Resolución de Problemas

### Problemas Comunes en Windows

- **Error de permisos en PowerShell**: Si no puedes ejecutar el script, intenta cambiar la política de ejecución:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

- **AWS CLI no está en el PATH**: Asegúrate de que AWS CLI esté instalado y agregado al PATH del sistema.

### Problemas Comunes en Unix

- **Permisos del script de despliegue**: Si el script no se puede ejecutar, agrégale permisos:
  ```bash
  chmod +x deploy.sh
  ```

- **Node.js o npm no encontrados**: Asegúrate de que Node.js esté instalado correctamente.

### Problemas Relacionados con la Base de Conocimiento

Si el agente no proporciona respuestas basadas en tu base de conocimiento:

1. Verifica que la base de conocimiento se haya configurado correctamente en la consola de Amazon Bedrock.
2. Asegúrate de que el agente tiene acceso y esté configurado para usar la base de conocimiento.
3. Comprueba que los datos ingresados en la base de conocimiento sean relevantes para las consultas realizadas.
4. Revisa los registros del agente en la consola de Amazon Bedrock para diagnosticar problemas.

## Licencia

MIT
