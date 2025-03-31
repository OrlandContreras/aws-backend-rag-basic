#!/usr/bin/env python3
# ==============================================================================
# FUNCIÓN LAMBDA PARA INVOCAR UN AGENTE DE BEDROCK
# ==============================================================================

import os
import json
import logging
import boto3
import sys
import traceback


# Configuración básica de logs para facilitar la depuración
logging.basicConfig(level = logging.INFO)
logger = logging.getLogger(__name__)

# Encabezados CORS que se añadirán a todas las respuestas
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",  # En producción, restringe esto a dominios específicos
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
}

def lambda_handler(event, context=None):
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
        # Manejar solicitudes preflight OPTIONS para CORS
        if isinstance(event, dict) and event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
            return {
                "statusCode": 200,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({"message": "CORS preflight handled successfully"})
            }
        
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
        elif isinstance(event, str):
            # Si se pasa directamente un string (caso de uso directo)
            prompt = event
        
        # Verificar si hay variables de entorno, si no, asignar valores por defecto
        agent_id = os.environ.get('BEDROCK_AGENT_ID')
        agent_alias_id = os.environ.get('BEDROCK_AGENT_ALIAS_ID')
        
        if not agent_id or not agent_alias_id:
            print("ADVERTENCIA: Variables de entorno no configuradas.")
            print(f"BEDROCK_AGENT_ID: {agent_id}")
            print(f"BEDROCK_AGENT_ALIAS_ID: {agent_alias_id}")
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": "Variables de entorno BEDROCK_AGENT_ID y BEDROCK_AGENT_ALIAS_ID no configuradas"
                })
            }

        print(f"Prompt a usar: {prompt}")  
        print(f"Agent ID: {agent_id}")
        print(f"Agent Alias ID: {agent_alias_id}")
        
        # Inicializar el cliente de Bedrock Agent Runtime
        client = boto3.client("bedrock-agent-runtime")        
        
        # Invocar al agente de Bedrock usando los IDs configurados en variables de entorno
        response = client.invoke_agent(
            agentId=agent_id,
            agentAliasId=agent_alias_id,
            sessionId="session-1",  # ID de sesión fijo - podría mejorarse para sesiones dinámicas
            inputText=prompt
        )

        # Procesar la respuesta del agente (que viene en formato de stream)
        completion = ""

        for event in response.get("completion"):
            chunk = event["chunk"]
            completion += chunk["bytes"].decode()

        print(f"Respuesta del agente: {completion}")

        # Devolver respuesta exitosa con formato JSON para API Gateway y encabezados CORS
        return {
            "statusCode": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({
                "message": completion
            })
        }
    except Exception as e:
        # Manejar y registrar cualquier error que ocurra
        traceback_str = traceback.format_exc()
        logger.error(f"Could not invoke agent: {e}")
        logger.error(f"Traceback: {traceback_str}")
        print(f"ERROR: {e}")
        print(f"TRACEBACK: {traceback_str}")
        
        # Devolver respuesta de error con formato JSON para API Gateway y encabezados CORS
        return {
            "statusCode": 500,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({
                "error": str(e),
                "traceback": traceback_str
            })
        }

# Código para ejecutar el script directamente
if __name__ == "__main__":
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
        result = lambda_handler(prompt)
        if isinstance(result, dict) and 'body' in result:
            try:
                body = json.loads(result['body'])
                if 'message' in body:
                    print("\nRespuesta:")
                    print(body['message'])
                elif 'error' in body:
                    print("\nError:")
                    print(body['error'])
                    if 'traceback' in body:
                        print("\nTraceback:")
                        print(body['traceback'])
            except:
                print(result['body'])
    else:
        print("Uso: python main.py \"Tu pregunta aquí\"")
