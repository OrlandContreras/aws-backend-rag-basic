export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: number;
}

export interface ApiResponse {
  message: string;
  [key: string]: any;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
} 