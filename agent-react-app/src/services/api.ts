import { ApiResponse } from '@/types';

// Obtener la URL de la API desde las variables de entorno o usar una URL predeterminada
const API_URL = import.meta.env.VITE_API_URL || '/api/agent';

console.log('API_URL utilizada:', API_URL); // Logging para depuración

export const sendMessageToAgent = async (prompt: string, sessionId?: string): Promise<ApiResponse> => {
  try {
    console.log(`Enviando mensaje al agente: "${prompt}" con sesión: ${sessionId || 'nueva'}`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors', // Explícitamente indicar que estamos haciendo una solicitud CORS
      body: JSON.stringify({
        prompt,
        sessionId: sessionId || undefined
      }),
    });

    console.log('Estado de respuesta HTTP:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Respuesta de error completa:', errorText);
      throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Datos recibidos de la API:', data);
    return data;
  } catch (error) {
    console.error('Error al comunicarse con el agente:', error);
    throw error;
  }
}; 