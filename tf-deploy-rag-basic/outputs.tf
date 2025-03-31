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
