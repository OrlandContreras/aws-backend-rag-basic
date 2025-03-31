import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState } from '@/types';
import { sendMessageToAgent } from '@/services/api';

const STORAGE_KEY = 'chat_history';
const SESSION_ID_KEY = 'chat_session_id';
const CHAT_HISTORY_KEY = 'chat_history_archive';

// Generar un nuevo ID de sesión para identificar una conversación única
const generateSessionId = (): string => {
  return `session_${uuidv4().replace(/-/g, '')}_${Date.now()}`;
};

export const useChat = (): [
  ChatState,
  (content: string) => Promise<void>,
  () => void,
  () => void
] => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Obtener o crear un ID de sesión para la conversación actual
  const [sessionId, setSessionId] = useState<string>(() => {
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
    if (savedSessionId) {
      return savedSessionId;
    } else {
      const newSessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, newSessionId);
      return newSessionId;
    }
  });

  // Cargar mensajes del localStorage al iniciar
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setState(prevState => ({
          ...prevState,
          messages: parsedMessages,
        }));
      } catch (error) {
        console.error('Error al cargar el historial de chat:', error);
        localStorage.removeItem(STORAGE_KEY); // Eliminar el historial corrupto
        setState(prevState => ({
          ...prevState,
          messages: [],
        }));
      }
    }
  }, []);

  // Guardar mensajes en localStorage cuando cambian
  useEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
    }
  }, [state.messages]);

  // Función para obtener un mensaje de error más descriptivo
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return 'Error de conexión: No pudimos conectarnos al servidor. Verifica tu conexión a internet.';
      }
      
      // Extraer código de estado HTTP del mensaje de error (si existe)
      const statusMatch = error.message.match(/Error: (\d+)/);
      if (statusMatch && statusMatch[1]) {
        const statusCode = statusMatch[1];
        
        switch (statusCode) {
          case '400':
            return 'Error 400: Solicitud incorrecta. Hay un problema con la solicitud enviada.';
          case '401':
            return 'Error 401: No autorizado. Debes iniciar sesión para continuar.';
          case '403':
            return 'Error 403: Acceso prohibido. No tienes permiso para esta acción.';
          case '404':
            return 'Error 404: Recurso no encontrado. El servidor no pudo encontrar lo solicitado.';
          case '429':
            return 'Error 429: Demasiadas solicitudes. Has superado el límite permitido.';
          case '500':
            return 'Error 500: Error interno del servidor. Estamos experimentando problemas técnicos.';
          case '502':
            return 'Error 502: Puerta de enlace incorrecta. Problema con el servidor intermedio.';
          case '503':
            return 'Error 503: Servicio no disponible. El servidor no está listo para manejar la solicitud.';
          case '504':
            return 'Error 504: Tiempo de espera agotado. El servidor tardó demasiado en responder.';
          default:
            return `Error ${statusCode}: Ocurrió un problema con tu solicitud.`;
        }
      }
      
      return error.message;
    }
    
    return 'Error desconocido al procesar tu solicitud.';
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    // Si es el mensaje inicial de sistema y no debe mostrarse, solo enviar la petición
    const isSystemInitialMessage = content === "inicio_conversacion";
    
    if (!isSystemInitialMessage) {
      // Crear y agregar mensaje del usuario solo si no es el mensaje inicial del sistema
      const userMessage: Message = {
        id: uuidv4(),
        content,
        sender: 'user',
        timestamp: Date.now(),
      };

      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, userMessage],
        isLoading: true,
        error: null,
      }));
    } else {
      // Si es mensaje inicial, solo actualizar el estado de carga
      setState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));
    }

    try {
      // Enviar mensaje al agente con el ID de sesión actual
      const response = await sendMessageToAgent(content, sessionId);
      
      // Crear y agregar respuesta del agente
      const agentMessage: Message = {
        id: uuidv4(),
        content: response.message,
        sender: 'agent',
        timestamp: Date.now(),
      };

      setState(prevState => ({
        ...prevState,
        // Si es mensaje del sistema, no incluir el mensaje del usuario
        messages: isSystemInitialMessage 
          ? [agentMessage]
          : [...prevState.messages, agentMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: getErrorMessage(error),
      }));
    }
  };

  // Función para limpiar sólo la conversación actual, manteniendo el historial
  const clearChat = useCallback((): void => {
    // Guardar mensajes actuales en el historial antes de limpiar
    if (state.messages.length > 0) {
      try {
        // Obtener el historial existente o crear uno nuevo
        const existingHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
        
        // Añadir la conversación actual al historial
        historyArray.push({
          id: sessionId,
          timestamp: Date.now(),
          messages: state.messages
        });
        
        // Guardar el historial actualizado
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyArray));
      } catch (error) {
        console.error('Error al guardar el historial:', error);
      }
    }
    
    // Limpiar solo la conversación actual, manteniendo el mismo ID de sesión
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
    
    // Eliminar mensajes actuales pero mantener el ID de sesión
    localStorage.removeItem(STORAGE_KEY);
    
    console.log('🧹 Limpiando conversación actual, manteniendo historial');
  }, [state.messages, sessionId]);

  // Función para crear una nueva conversación (borra todo el historial)
  const newConversation = useCallback((): void => {
    // Generar un nuevo ID de sesión para la nueva conversación
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    localStorage.setItem(SESSION_ID_KEY, newSessionId);
    
    // Limpiar el estado y localStorage
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
    
    // Limpiar el historial local
    localStorage.removeItem(STORAGE_KEY);
    
    // Limpiar el historial completo
    localStorage.removeItem(CHAT_HISTORY_KEY);
    
    // Limpiar cookies relacionadas con la sesión (si existen)
    document.cookie.split(";").forEach(c => {
      if (c.trim().startsWith("chat_")) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });
    
    console.log('🔄 Iniciando nueva conversación con ID de sesión:', newSessionId);
  }, []);

  return [state, sendMessage, clearChat, newConversation];
}; 