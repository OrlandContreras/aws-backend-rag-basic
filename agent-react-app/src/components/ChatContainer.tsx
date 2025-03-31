import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatInput } from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { MdDeleteSweep } from "react-icons/md";
import { RiRobot2Fill } from "react-icons/ri";
import { MdRefresh } from "react-icons/md";
import { ErrorMessage } from "@/components/ErrorMessage";
import { NewChatDialog } from "@/components/NewChatDialog";
import { useEffect, useRef } from "react";

export const ChatContainer = () => {
  const [{ messages, isLoading, error }, sendMessage, clearChat, newConversation] = useChat();
  const initialMessageSent = useRef(false);

  // Iniciar la conversación automáticamente cuando se carga la interfaz por primera vez
  useEffect(() => {
    // Solo enviar el mensaje inicial una vez cuando no hay mensajes
    if (messages.length === 0 && !initialMessageSent.current && !isLoading) {
      initialMessageSent.current = true;
      // Enviar un mensaje inicial invisible al agente para activar el saludo
      sendMessage("inicio_conversacion");
    }
  }, [messages, isLoading]);

  // Función para manejar la creación de una nueva conversación
  const handleNewConversation = () => {
    initialMessageSent.current = false;
    newConversation();
  };

  // Función para reintentar el último mensaje en caso de error
  const handleRetry = () => {
    // Si hay mensajes del usuario, reintentar el último mensaje
    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find(msg => msg.sender === 'user');
      
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
        return;
      }
    }
    
    // Si no hay mensajes previos o solo mensajes del agente, 
    // probablemente falló el saludo inicial - intentar nuevamente
    initialMessageSent.current = false; // Reiniciar el estado para permitir un nuevo intento
    sendMessage("inicio_conversacion");
  };

  return (
    <Card className="w-full max-w-full h-screen md:max-w-3xl lg:max-w-4xl md:h-[90vh] lg:h-[85vh] flex flex-col overflow-hidden shadow-lg">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl md:text-2xl font-semibold text-indigo-500 flex items-center">
            <RiRobot2Fill className="mr-2 text-violet-600" />
            Chat con Agente IA
          </CardTitle>
          
          <NewChatDialog onConfirm={handleNewConversation}>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 hover:text-green-800 hover:bg-green-50 flex items-center border-green-200"
            >
              <MdRefresh className="mr-1" />
              <span className="hidden sm:inline">Nueva conversación</span>
            </Button>
          </NewChatDialog>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearChat}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center"
        >
          <MdDeleteSweep className="mr-1" />
          <span className="hidden sm:inline">Limpiar Chat</span>
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ChatHistory messages={messages} isLoading={isLoading} />
      </CardContent>
      
      {error && (
        <div className="px-4 py-2">
          <ErrorMessage error={error} onRetry={handleRetry} />
        </div>
      )}
      
      <CardFooter className="p-0 border-t">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </CardFooter>
    </Card>
  );
}; 