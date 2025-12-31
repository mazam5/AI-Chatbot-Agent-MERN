export class ChatStorage {
  private static SESSIONS_KEY = 'chatSessions'

  static generateTitle(firstMessage: string): string {
    const cleaned = firstMessage.trim()
    if (cleaned.length <= 50) return cleaned
    return cleaned.substring(0, 47) + '...'
  }

  static saveSession(sessionId: string, messages: ChatMessage[]): void {
    try {
      // Save messages for this session
      const messagesData = messages.map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }))
      localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messagesData))

      const sessions = this.getAllSessions()
      const existingIndex = sessions.findIndex((s) => s.id === sessionId)

      const userMessages = messages.filter((m) => m.role === 'user')
      const lastMessage = messages[messages.length - 1]
      const firstUserMessage = userMessages[0]?.content || 'New Chat'

      const sessionData: ChatSession = {
        id: sessionId,
        title: this.generateTitle(firstUserMessage),
        lastMessage: lastMessage?.content.substring(0, 60) || '',
        timestamp: new Date(),
        messageCount: messages.length,
      }

      if (existingIndex >= 0) {
        sessions[existingIndex] = sessionData
      } else {
        sessions.unshift(sessionData)
      }

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  static loadMessages(sessionId: string): ChatMessage[] | null {
    try {
      const data = localStorage.getItem(`chat_messages_${sessionId}`)
      if (!data) return null

      const parsed = JSON.parse(data)
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    } catch (error) {
      console.error('Failed to load messages:', error)
      return null
    }
  }

  static getAllSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY)
      if (!data) return []

      const parsed = JSON.parse(data)
      return parsed.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp),
      }))
    } catch (error) {
      console.error('Failed to load sessions:', error)
      return []
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      // Remove messages
      localStorage.removeItem(`chat_messages_${sessionId}`)

      // Remove from sessions list
      const sessions = this.getAllSessions()
      const filtered = sessions.filter((s) => s.id !== sessionId)
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  static clearAll(): void {
    try {
      const sessions = this.getAllSessions()
      sessions.forEach((s) => {
        localStorage.removeItem(`chat_messages_${s.id}`)
      })
      localStorage.removeItem(this.SESSIONS_KEY)
    } catch (error) {
      console.error('Failed to clear all data:', error)
    }
  }
}
