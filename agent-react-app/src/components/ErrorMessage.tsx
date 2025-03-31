import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BiErrorCircle, BiInfoCircle } from "react-icons/bi";
import { IoReload } from "react-icons/io5";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  // Función para analizar el error y ofrecer soluciones
  const getErrorDetails = (errorMessage: string) => {
    // Error 500
    if (errorMessage.includes("500") || errorMessage.includes("Error: 500") || errorMessage.includes("Error de servidor")) {
      return {
        title: "Error de servidor",
        description: "Hubo un problema en el servidor. Esto podría deberse a una alta demanda o a un problema temporal.",
        solution: "Por favor, intenta nuevamente en unos momentos. Si el problema persiste, el servicio podría estar en mantenimiento.",
        buttonText: "Intentar nuevamente"
      };
    }
    
    // Error 429
    if (errorMessage.includes("429") || errorMessage.includes("Error: 429")) {
      return {
        title: "Demasiadas solicitudes",
        description: "Has enviado demasiadas solicitudes en poco tiempo.",
        solution: "Por favor, espera un momento antes de enviar más mensajes.",
        buttonText: "Reintentar"
      };
    }
    
    // Error 403
    if (errorMessage.includes("403") || errorMessage.includes("Error: 403")) {
      return {
        title: "Acceso denegado",
        description: "No tienes permiso para realizar esta acción.",
        solution: "Verifica tus credenciales o contacta al administrador del sistema.",
        buttonText: "Reintentar"
      };
    }
    
    // Error 404
    if (errorMessage.includes("404") || errorMessage.includes("Error: 404")) {
      return {
        title: "Recurso no encontrado",
        description: "El recurso solicitado no existe o fue movido.",
        solution: "Verifica la URL o contacta al administrador del sistema.",
        buttonText: "Reintentar"
      };
    }
    
    // Error de conexión
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError") || errorMessage.includes("conexión")) {
      return {
        title: "Error de conexión",
        description: "No pudimos conectarnos al servidor.",
        solution: "Verifica tu conexión a internet o inténtalo más tarde.",
        buttonText: "Reintentar conexión"
      };
    }
    
    // Error predeterminado
    return {
      title: "Error inesperado",
      description: "Ocurrió un error inesperado al procesar tu solicitud.",
      solution: "Por favor, intenta nuevamente o contacta al soporte si el problema persiste.",
      buttonText: "Reintentar"
    };
  };
  
  const errorDetails = getErrorDetails(error);
  
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
      <div className="flex items-start">
        <BiErrorCircle className="h-5 w-5 mt-0.5 mr-2 text-red-500" />
        <div className="flex-1">
          <AlertTitle className="text-red-700 font-medium text-sm">{errorDetails.title}</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            <p>{errorDetails.description}</p>
            <p className="mt-1 flex items-center">
              <BiInfoCircle className="h-4 w-4 mr-1 text-red-500" />
              <span>{errorDetails.solution}</span>
            </p>
          </AlertDescription>
          
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="mt-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
            >
              <IoReload className="mr-1 h-4 w-4" />
              {errorDetails.buttonText}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}; 