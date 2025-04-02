# ==============================================================================
# OUTPUTS
# ==============================================================================

# Añade aquí outputs para URLs y otros valores importantes
output "api_gateway_url" {
  value       = "${aws_apigatewayv2_stage.default.invoke_url}/agent"
  description = "URL del API Gateway para invocar el agente Bedrock a través de Lambda"
}

output "lambda_function_url" {
  value       = aws_lambda_function_url.lambda_url.function_url
  description = "URL directa de la función Lambda (alternativa al API Gateway)"
}

output "agent_id" {
  value       = aws_bedrockagent_agent.bedrock_agent.agent_id
  description = "ID del agente Bedrock creado"
}

output "agent_alias_id" {
  value       = aws_bedrockagent_agent_alias.bedrock_agent_alias.agent_alias_id
  description = "ID del alias del agente Bedrock"
}

output "frontend_website_url" {
  value       = var.deploy_ui ? "http://${aws_s3_bucket.frontend_bucket[0].bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com" : "UI no desplegada (deploy_ui = false)"
  description = "URL del sitio web estático para el frontend en S3 (si está habilitado)"
}

output "ui_deployed" {
  value       = var.deploy_ui
  description = "Indica si la interfaz de usuario ha sido desplegada"
}

output "frontend_bucket_name" {
  value       = var.deploy_ui ? aws_s3_bucket.frontend_bucket[0].bucket : "UI no desplegada (deploy_ui = false)"
  description = "Nombre del bucket S3 donde se debe desplegar el frontend"
}
