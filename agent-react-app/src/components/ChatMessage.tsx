import { Message } from '@/types';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";
import React from 'react';

interface ChatMessageProps {
  message: Message;
}

// Función para formatear texto con viñetas y otros elementos
const formatText = (text: string): React.ReactNode[] => {
  // Detectar diferentes patrones de viñetas y enumeraciones
  const hasBullets = text.includes(' - ') || 
                    text.match(/\n-\s/) !== null || 
                    text.match(/\s-\s/) !== null;
  
  // Detectar si hay patrones de enumeración (1., 2., etc.)
  const hasNumbering = text.match(/\d+\.\s/) !== null || 
                      text.match(/\n\d+\.\s/) !== null || 
                      text.match(/\d+\:\s/) !== null;
  
  if (!hasBullets && !hasNumbering) {
    return [<p key="single-paragraph">{text}</p>];
  }

  // Dividir por líneas para manejar múltiples párrafos
  const paragraphs = text.split('\n');
  const result: React.ReactNode[] = [];
  
  let currentIntro: string | null = null;
  let currentBullets: string[] = [];
  let processingList = false;
  
  // Procesar cada párrafo
  paragraphs.forEach((paragraph, index) => {
    // Detectar si el párrafo es parte de una lista con viñetas
    const isBulletPoint = paragraph.trim().match(/^-\s/) || 
                          paragraph.trim().startsWith('- ') ||
                          paragraph.includes(' - ');
    
    // Detectar si el párrafo es parte de una lista numerada
    const isNumberPoint = paragraph.trim().match(/^\d+\.\s/) || 
                          paragraph.trim().match(/^\d+\:\s/);
    
    // Si es la primera línea de una posible lista con formato "texto: - item1 - item2"
    if (!processingList && paragraph.includes(' - ')) {
      const colonIndex = paragraph.indexOf(':');
      const dashIndex = paragraph.indexOf(' - ');
      
      // Caso: "texto: - item1 - item2" o "texto - item1 - item2"
      if ((colonIndex > -1 && dashIndex > colonIndex) || colonIndex === -1) {
        processingList = true;
        
        // Extraer la parte introductoria
        if (colonIndex > -1) {
          currentIntro = paragraph.substring(0, colonIndex + 1);
          // Extraer los elementos después de la introducción
          const listPart = paragraph.substring(colonIndex + 1);
          // Dividir por " - " para obtener los elementos
          currentBullets = listPart.split(' - ')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        } else {
          // Caso: "texto - item1 - item2"
          const parts = paragraph.split(' - ');
          currentIntro = parts[0];
          currentBullets = parts.slice(1).filter(item => item.trim().length > 0);
        }
        
        // Renderizar la introducción y la lista
        result.push(
          <div key={`list-${index}`} className="mb-2">
            {currentIntro && <p>{currentIntro}</p>}
            <ul className="list-disc pl-5 mt-1">
              {currentBullets.map((point, i) => (
                <li key={`bullet-${index}-${i}`}>{point}</li>
              ))}
            </ul>
          </div>
        );
        
        // Reiniciar para la próxima lista
        currentIntro = null;
        currentBullets = [];
        processingList = false;
      } else {
        // Es un párrafo normal
        result.push(<p key={`paragraph-${index}`} className="mb-2">{paragraph}</p>);
      }
    }
    // Si es un elemento de lista numerada (1., 2., etc.)
    else if (isNumberPoint) {
      processingList = true;
      
      // Si es el primer elemento de la lista
      if (currentBullets.length === 0) {
        // Extraer el número y el texto
        const match = paragraph.trim().match(/^(\d+)[\.\:]\s*(.*)/);
        if (match) {
          currentBullets.push(match[2].trim());
        } else {
          currentBullets.push(paragraph.trim());
        }
      } else {
        // Agregar otro elemento a la lista actual
        const match = paragraph.trim().match(/^(\d+)[\.\:]\s*(.*)/);
        if (match) {
          currentBullets.push(match[2].trim());
        } else {
          currentBullets.push(paragraph.trim());
        }
      }
      
      // Si es el último párrafo o el siguiente no es un elemento de lista numerada
      const isLastParagraph = index === paragraphs.length - 1;
      const nextIsNotNumberPoint = !isLastParagraph && 
                                  !paragraphs[index+1].trim().match(/^\d+\.\s/) &&
                                  !paragraphs[index+1].trim().match(/^\d+\:\s/);
      
      if (isLastParagraph || nextIsNotNumberPoint) {
        // Renderizar la lista acumulada
        result.push(
          <div key={`list-${index}`} className="mb-2">
            {currentIntro && <p>{currentIntro}</p>}
            <ol className="list-decimal pl-5 mt-1">
              {currentBullets.map((point, i) => (
                <li key={`number-${index}-${i}`}>{point}</li>
              ))}
            </ol>
          </div>
        );
        
        // Reiniciar para la próxima lista
        currentIntro = null;
        currentBullets = [];
        processingList = false;
      }
    }
    // Si es un elemento de lista con formato "- item"
    else if (isBulletPoint) {
      processingList = true;
      
      // Si es el primer elemento de la lista
      if (currentBullets.length === 0) {
        // Buscar si hay texto antes del primer guión
        const dashIndex = paragraph.indexOf('- ');
        if (dashIndex > 0) {
          currentIntro = paragraph.substring(0, dashIndex).trim();
          currentBullets.push(paragraph.substring(dashIndex + 2).trim());
        } else {
          currentBullets.push(paragraph.replace(/^-\s+/, '').trim());
        }
      } else {
        // Agregar otro elemento a la lista actual
        currentBullets.push(paragraph.replace(/^-\s+/, '').trim());
      }
      
      // Si es el último párrafo o el siguiente no es un elemento de lista
      const isLastParagraph = index === paragraphs.length - 1;
      const nextIsNotBullet = !isLastParagraph && 
                             !paragraphs[index+1].trim().match(/^-\s/) &&
                             !paragraphs[index+1].trim().startsWith('- ');
      
      if (isLastParagraph || nextIsNotBullet) {
        // Renderizar la lista acumulada
        result.push(
          <div key={`list-${index}`} className="mb-2">
            {currentIntro && <p>{currentIntro}</p>}
            <ul className="list-disc pl-5 mt-1">
              {currentBullets.map((point, i) => (
                <li key={`bullet-${index}-${i}`}>{point}</li>
              ))}
            </ul>
          </div>
        );
        
        // Reiniciar para la próxima lista
        currentIntro = null;
        currentBullets = [];
        processingList = false;
      }
    }
    // Es un párrafo normal y no estamos procesando una lista
    else if (!processingList && paragraph.trim().length > 0) {
      result.push(<p key={`paragraph-${index}`} className="mb-2">{paragraph}</p>);
    }
  });
  
  return result.length > 0 ? result : [<p key="fallback">{text}</p>];
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const messageTime = new Date(message.timestamp).toLocaleTimeString();

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className={`w-8 h-8 ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-violet-100 text-violet-600'}`}>
        <AvatarFallback>
          {isUser ? <FaUser size={16} /> : <RiRobot2Fill size={16} />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`max-w-[80%] py-2 px-3 rounded-lg ${
        isUser 
          ? 'bg-indigo-100 rounded-tr-none' 
          : 'bg-gray-100 rounded-tl-none'
      }`}>
        <div className="break-words">
          <div className="flex justify-between mb-1 text-xs">
            <span className="font-bold">{isUser ? 'Tú' : 'Agente IA'}</span>
            <span className="text-gray-500">{messageTime}</span>
          </div>
          <div className="message-content">
            {formatText(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
}; 