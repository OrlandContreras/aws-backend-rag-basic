# ==============================================================================
# CONFIGURACIÓN BÁSICA DE RECURSOS PARA DESPLIEGUE DE UN AGENTE BEDROCK CON LAMBDA
# ==============================================================================

# Genera un sufijo aleatorio para garantizar nombres únicos de recursos
resource "random_pet" "naming" {
  length = 1
}

# ==============================================================================
# CONFIGURACIÓN DE ROLES Y PERMISOS IAM
# ==============================================================================

# Rol IAM que el agente de Bedrock asumirá para ejecutarse
resource "aws_iam_role" "agent_role" {
  assume_role_policy = data.aws_iam_policy_document.policy_agent_trust.json
  name_prefix        = "AmazonBedrockExecutionRoleForAgents_"
}

# Política que otorga al agente permisos para usar los modelos de Bedrock
resource "aws_iam_role_policy" "agent_role_policy" {
  name_prefix = "AmazonBedrockAgentBedrockFoundationModelPolicy_"
  policy      = data.aws_iam_policy_document.policy_agent_permissions.json
  role        = aws_iam_role.agent_role.id
}

# ==============================================================================
# CONFIGURACIÓN DE ALMACENAMIENTO S3
# ==============================================================================

# Bucket S3 para almacenar archivos relacionados con la aplicación
resource "aws_s3_bucket" "backend_bucket" {
  bucket        = "${var.bucket_name}-${random_pet.naming.id}"
  force_destroy = true

  tags = {
    Name        = "${var.bucket_name}-${random_pet.naming.id}"
    Environment = "Dev"
  }
}

# ==============================================================================
# CONFIGURACIÓN DEL AGENTE BEDROCK
# ==============================================================================

# Definición del agente de Bedrock con el modelo de base especificado
resource "aws_bedrockagent_agent" "bedrock_agent" {
  agent_name                  = "${var.agent_name}-${random_pet.naming.id}"
  agent_resource_role_arn     = aws_iam_role.agent_role.arn
  idle_session_ttl_in_seconds = 500
  foundation_model            = var.foundation_model
  instruction                 = var.instruction

  depends_on = [aws_iam_role.agent_role]
}

# Alias para el agente, necesario para invocar el agente en producción
resource "aws_bedrockagent_agent_alias" "bedrock_agent_alias" {
  agent_alias_name = "${aws_bedrockagent_agent.bedrock_agent.agent_name}-alias"
  agent_id         = aws_bedrockagent_agent.bedrock_agent.agent_id
  description      = "Alias for the agent"
  depends_on       = [aws_bedrockagent_agent.bedrock_agent]
}

# ==============================================================================
# CONFIGURACIÓN DE LA FUNCIÓN LAMBDA
# ==============================================================================

# Empaqueta el código de la Lambda en un archivo ZIP
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../agent-py-demo-ai"
  output_path = "${path.module}/lambda_function.zip"
  excludes    = [".venv", "__pycache__", "*.pyc", ".git", ".gitignore"]
}

# Rol IAM específico para la función Lambda
resource "aws_iam_role" "lambda_role" {
  name = "bedrock_agent_lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Política que otorga a la Lambda permisos para invocar modelos y agentes de Bedrock
resource "aws_iam_role_policy" "lambda_bedrock_policy" {
  name = "bedrock_access"
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "bedrock:InvokeModel", # Permite invocar modelos directamente
          "bedrock:InvokeAgent", # Permite invocar agentes de Bedrock
          "logs:CreateLogGroup", # Permisos para CloudWatch Logs
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Definición de la función Lambda que interactúa con el agente de Bedrock
resource "aws_lambda_function" "bedrock_agent_lambda" {
  function_name    = "bedrock_agent_lambda_${random_pet.naming.id}"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "main.lambda_handler" # Punto de entrada en el archivo main.py
  runtime          = "python3.13"
  role             = aws_iam_role.lambda_role.arn
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      PYTHONPATH             = "."
      BEDROCK_AGENT_ID       = aws_bedrockagent_agent.bedrock_agent.agent_id
      BEDROCK_AGENT_ALIAS_ID = aws_bedrockagent_agent_alias.bedrock_agent_alias.agent_alias_id
    }
  }

  depends_on = [
    data.archive_file.lambda_zip,
    aws_iam_role_policy.lambda_bedrock_policy,
    aws_bedrockagent_agent.bedrock_agent,
    aws_bedrockagent_agent_alias.bedrock_agent_alias
  ]
}

# URL directa para la función Lambda (alternativa a API Gateway)
resource "aws_lambda_function_url" "lambda_url" {
  function_name      = aws_lambda_function.bedrock_agent_lambda.function_name
  authorization_type = "NONE"
}

# ==============================================================================
# CONFIGURACIÓN DEL API GATEWAY
# ==============================================================================

# API HTTP en API Gateway (más económico y moderno que REST API)
resource "aws_apigatewayv2_api" "bedrock_agent_api" {
  name          = "bedrock-agent-api-${random_pet.naming.id}"
  protocol_type = "HTTP"
  description   = "API Gateway para integración con el agente de Bedrock a través de Lambda"
}

# Integración entre API Gateway y la función Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.bedrock_agent_api.id
  integration_type = "AWS_PROXY"

  integration_uri        = aws_lambda_function.bedrock_agent_lambda.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0" # Formato moderno para HTTP APIs
}

# Ruta que define el endpoint POST /agent en la API
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.bedrock_agent_api.id
  route_key = "POST /agent"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Etapa de producción para la API con despliegue automático
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.bedrock_agent_api.id
  name        = "prod"
  auto_deploy = true
}

# Permiso para que API Gateway pueda invocar la función Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bedrock_agent_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # El ARN de origen permite invocar solo desde este API Gateway específico
  source_arn = "${aws_apigatewayv2_api.bedrock_agent_api.execution_arn}/*/*/agent"
}



