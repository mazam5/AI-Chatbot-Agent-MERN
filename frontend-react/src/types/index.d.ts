interface SendMessageRequest {
  message: string
  sessionId?: string
}
export interface ApiMessage {
  id: number
  conversationId: string
  sender: 'user' | 'ai'
  text: string
  createdAt: string
}
interface SendMessageResponse {
  reply: string
  sessionId: string
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date | string
  messageCount: number
}

interface MessageHistory {
  id: string
  conversationId: string
  sender: string
  text: string
  createdAt: string
}
interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}
