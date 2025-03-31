import { ApiResponse } from '@/types';

// Obtener la URL de la API desde las variables de entorno o usar una URL predeterminada
const API_URL = import.meta.env.VITE_API_URL || 'https://ga0wt6g7jc.execute-api.us-east-1.amazonaws.com/dev/agent';

export const sendMessageToAgent = async (prompt: string, sessionId?: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        sessionId: sessionId || undefined
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al comunicarse con el agente:', error);
    throw error;
  }
}; 