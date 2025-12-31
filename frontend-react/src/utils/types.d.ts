interface SendMessageRequest {
  message: string
  sessionId?: string
}

interface SendMessageResponse {
  reply: string
  sessionId: string
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
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}
