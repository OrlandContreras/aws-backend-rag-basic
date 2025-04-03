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

# Extraer valores para usarlos en la política
locals {
  model_parts             = split(".", var.foundation_model)
  model_region            = length(local.model_parts) > 0 ? local.model_parts[0] : "us"
  model_provider          = length(local.model_parts) > 1 ? local.model_parts[1] : "anthropic"
  model_name_with_version = length(local.model_parts) > 2 ? local.model_parts[2] : "claude-3-5-sonnet-20241022-v2"
  model_name              = split(":", local.model_name_with_version)[0]
}

# Documento de política que define los permisos que el agente Bedrock necesita
# para interactuar con otros servicios AWS, principalmente el modelo de fundación
data "aws_iam_policy_document" "policy_agent_permissions" {
  statement {
    actions = [
      "bedrock:InvokeModel",                   # Permite invocar el modelo
      "bedrock:InvokeModelWithResponseStream", # Permite invocar el modelo con streaming
      "bedrock:GetInferenceProfile",           # Permite obtener información del perfil de inferencia
      "bedrock:GetFoundationModel",            # Permite obtener información sobre el modelo base
      "bedrock:CreateKnowledgeBase",           # Permite crear knowledge base
      "bedrock:DeleteKnowledgeBase",           # Permite eliminar knowledge base
      "bedrock:AssociateKnowledgeBase",        # Permite asociar knowledge base al agente
      "bedrock:DisassociateKnowledgeBase",     # Permite desasociar knowledge base
      "bedrock:CreateDataSource",              # Permite crear fuentes de datos
      "bedrock:DeleteDataSource",              # Permite eliminar fuentes de datos
      "bedrock:UpdateDataSource",              # Permite actualizar fuentes de datos
      "bedrock:StartIngestionJob",             # Permite iniciar trabajos de ingestión
      "bedrock:GetIngestionJob",               # Permite obtener información de trabajos de ingestión
      "bedrock:Retrieve"                       # Permite recuperar información de knowledge bases
    ]
    # Recursos específicos a los que se aplican estos permisos, incluyendo comodines para
    # facilitar el acceso a cualquier versión del modelo
    resources = [
      "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:inference-profile/${var.foundation_model}",
      "arn:aws:bedrock:*::foundation-model/*",                                                                           # Permiso para acceder a cualquier modelo de fundación
      "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:knowledge-base/*", # Permiso para knowledge bases
      "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:agent/*",          # Permisos para agentes
    ]
  }
}
