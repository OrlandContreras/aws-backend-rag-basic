import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RiRobot2Fill } from "react-icons/ri";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8 bg-violet-100 text-violet-600">
        <AvatarFallback>
          <RiRobot2Fill size={16} />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center py-2 px-4 w-fit bg-gray-100 rounded-lg rounded-tl-none">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
        </div>
      </div>
    </div>
  );
}; 