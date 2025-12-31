import type { ApiMessage } from '@/types'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ChatResponse {
  reply: string
  sessionId: string
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messageCount: number
}

export const chatAPI = {
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await axios.post(`${API_BASE_URL}/api/chat/message`, {
      message,
      sessionId,
    })
    return response.data
  },

  async getChatHistory(sessionId: string): Promise<ApiMessage[]> {
    const response = await axios.get(`${API_BASE_URL}/api/chat/history/${sessionId}`)
    return response.data
  },

  async getSessions(): Promise<ChatSession[]> {
    const response = await axios.get(`${API_BASE_URL}/api/chat/sessions`)
    return response.data
  },

  async deleteSession(sessionId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/chat/session/${sessionId}`)
  },
}
