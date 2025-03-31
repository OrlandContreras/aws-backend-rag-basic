import { useState, FormEvent, KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoMdSend } from "react-icons/io";
import { ImSpinner8 } from "react-icons/im";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      await onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && message.trim()) {
      e.preventDefault();
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 w-full">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        disabled={isLoading}
        autoComplete="off"
        aria-label="Mensaje"
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !message.trim()}
        variant="default"
        className="bg-indigo-500 hover:bg-indigo-600 px-4"
      >
        {isLoading ? (
          <ImSpinner8 className="animate-spin mr-1" />
        ) : (
          <IoMdSend className="mr-1" />
        )}
        <span className="hidden sm:inline">{isLoading ? 'Enviando...' : 'Enviar'}</span>
      </Button>
    </form>
  );
}; 