import { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { ChatMessage } from '@/components/ChatMessage';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { BsChatSquareText } from "react-icons/bs";

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Desplazar al final cuando se añaden nuevos mensajes o cuando está cargando
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[50vh] text-gray-400 text-center gap-3">
            {isLoading ? (
              <>
                <TypingIndicator />
                <p>El agente está preparando tu saludo...</p>
              </>
            ) : (
              <>
                <BsChatSquareText size={40} className="text-gray-300" />
                <p>Iniciando conversación...</p>
              </>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}; 