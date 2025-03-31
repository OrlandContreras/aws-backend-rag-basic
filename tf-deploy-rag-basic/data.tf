# ==============================================================================
# DATOS DE CONTEXTO AWS
# ==============================================================================

# Obtiene información sobre la cuenta AWS actualmente en uso
data "aws_caller_identity" "current" {}

# Obtiene información sobre la partición AWS actual (aws, aws-cn, aws-us-gov)
data "aws_partition" "current" {}

# Obtiene información sobre la región AWS configurada
data "aws_region" "current" {}

# ==============================================================================
# DOCUMENTOS DE POLÍTICA IAM
# ==============================================================================

# Documento de política que define la relación de confianza para el agente Bedrock
# Permite que el servicio bedrock.amazonaws.com asuma el rol, con restricciones de seguridad
data "aws_iam_policy_document" "policy_agent_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["bedrock.amazonaws.com"]
      type        = "Service"
    }
    # Condición que limita el uso del rol a la cuenta AWS actual
    condition {
      test     = "StringEquals"
      values   = [data.aws_caller_identity.current.account_id]
      variable = "aws:SourceAccount"
    }
    # Condición que limita el uso del rol a recursos de agente de Bedrock
    condition {
      test = "ArnLike"
      values = [
        "arn:${data.aws_partition.current.partition}:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:agent/*"
      ]
      variable = "AWS:SourceArn"
    }
  }
}

# Documento de política que define los permisos que el agente Bedrock necesita
# para interactuar con otros servicios AWS, principalmente el modelo de fundación
data "aws_iam_policy_document" "policy_agent_permissions" {
  statement {
    actions = [
      "bedrock:InvokeModel",                   # Permite invocar el modelo
      "bedrock:InvokeModelWithResponseStream", # Permite invocar el modelo con streaming
      "bedrock:GetInferenceProfile",           # Permite obtener información del perfil de inferencia
      "bedrock:GetFoundationModel"             # Permite obtener información sobre el modelo base
    ]
    # Recursos específicos a los que se aplican estos permisos:
    # 1. El perfil de inferencia del modelo especificado en la variable
    # 2. El modelo de fundación específico utilizado
    resources = [
      "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.id}:inference-profile/${var.foundation_model}",
      "arn:aws:bedrock:*::foundation-model/${split(".", var.foundation_model)[1]}.${split(".", var.foundation_model)[2]}"
    ]
  }
}
