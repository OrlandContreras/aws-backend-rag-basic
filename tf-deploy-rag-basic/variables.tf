# ==============================================================================
# VARIABLES DE CONFIGURACIÓN PARA EL DESPLIEGUE DEL AGENTE BEDROCK
# ==============================================================================

variable "region" {
  type        = string
  description = "Región de AWS donde se desplegarán los recursos (ejemplo: us-east-1, us-west-2)"
}

variable "foundation_model" {
  type        = string
  description = "ID del modelo de fundación de Bedrock a utilizar (ejemplo: anthropic.claude-3-sonnet-20240229-v1:0)"
}

variable "agent_name" {
  type        = string
  description = "Nombre base del agente Bedrock que se creará, se añadirá un sufijo aleatorio"
}

variable "instruction" {
  type        = string
  description = "Instrucciones detalladas para el agente Bedrock que definen su comportamiento y capacidades"
}

variable "bucket_name" {
  type        = string
  description = "Nombre base del bucket S3 que se creará para almacenar los archivos relacionados, se añadirá un sufijo aleatorio"
}
