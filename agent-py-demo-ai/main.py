#!/usr/bin/env python3
# ==============================================================================
# FUNCIÓN LAMBDA PARA INVOCAR UN AGENTE DE BEDROCK
# ==============================================================================

import os
import json
import logging
import boto3


# Configuración básica de logs para facilitar la depuración
logging.basicConfig(level = logging.INFO)
logger = logging.getLogger(__name__)

def lambda_handler(event, context):
    """
    Función principal que maneja las invocaciones a la Lambda.
    Recibe solicitudes, extrae el prompt y lo envía al agente de Bedrock.
    
    Args:
        event (dict): Evento de Lambda con los datos de la solicitud
        context (LambdaContext): Información sobre la ejecución de la Lambda
        
    Returns:
        dict: Respuesta formateada para API Gateway con la respuesta del agente
    """
    print("Hello from agent-py-demo-ai!")
    try:
        # Imprimir el evento para depuración
        print(f"Evento recibido: {event}")
        
        # Extraer el prompt con manejo flexible de diferentes formatos de entrada
        prompt = None
        
        if isinstance(event, dict):
            # Si el prompt viene directamente en el evento
            prompt = event.get('prompt')
            
            # Si el prompt viene en el body (caso común en API Gateway)
            if not prompt and 'body' in event:
                body = event['body']
                # Si el body es string (formato JSON), convertirlo a dict
                if isinstance(body, str):
                    body = json.loads(body)
                if isinstance(body, dict):
                    prompt = body.get('prompt')


        print(f"Prompt a usar: {prompt}")  
        
        # Inicializar el cliente de Bedrock Agent Runtime
        client = boto3.client("bedrock-agent-runtime")        
        
        # Invocar al agente de Bedrock usando los IDs configurados en variables de entorno
        response = client.invoke_agent(
            agentId=os.environ.get('BEDROCK_AGENT_ID'),
            agentAliasId=os.environ.get('BEDROCK_AGENT_ALIAS_ID'),
            sessionId="session-1",  # ID de sesión fijo - podría mejorarse para sesiones dinámicas
            inputText = prompt
        )

        # Procesar la respuesta del agente (que viene en formato de stream)
        completion = ""

        for event in response.get("completion"):
            chunk = event["chunk"]
            completion += chunk["bytes"].decode()

        # Devolver respuesta exitosa con formato JSON para API Gateway
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": completion
            })
        }
    except Exception as e:
        # Manejar y registrar cualquier error que ocurra
        logger.error(f"Could not invoke agent: {e}")
        
        # Devolver respuesta de error con formato JSON para API Gateway
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }
