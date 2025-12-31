import { chatAPI } from '@/services/chatApi'
import type { ApiMessage, ChatMessage } from '@/types'
import { AlertCircle, Bot, Check, Copy, Loader2, Send, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ToggleTheme } from './theme/ToggleTheme'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface ChatContainerProps {
  currentSessionId: string | null
  onSessionUpdate: (sessionId: string) => void
}

const ChatContainer = ({ currentSessionId, onSessionUpdate }: ChatContainerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'ai',
      content: "Hello! I'm your customer support agent. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const quickReplies = [
    'What’s your return policy?',
    'Do you ship to USA?',
    'How can I track my order?',
    'What payment methods do you accept?',
    'I need help with a product',
  ]

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  useEffect(() => {
    const loadMessages = async () => {
      if (currentSessionId) {
        setIsLoadingHistory(true)
        try {
          const history = await chatAPI.getChatHistory(currentSessionId)

          if (history && history.length > 0) {
            const formattedMessages: ChatMessage[] = history.map((msg: ApiMessage) => ({
              id: msg.id,
              role: msg.sender === 'user' ? 'user' : 'ai',
              content: msg.text,
              timestamp: new Date(msg.createdAt),
            }))
            setMessages(formattedMessages)
          } else {
            setMessages([
              {
                id: 1,
                role: 'ai',
                content: "Hello! I'm your customer support agent. How can I help you today?",
                timestamp: new Date(),
              },
            ])
          }
        } catch (err) {
          console.error('Failed to load chat history:', err)
          setError('Failed to load chat history')

          setMessages([
            {
              id: 1,
              role: 'ai',
              content: "Hello! I'm your customer support agent. How can I help you today?",
              timestamp: new Date(),
            },
          ])
        } finally {
          setIsLoadingHistory(false)
        }
      } else {
        setMessages([
          {
            id: 1,
            role: 'ai',
            content: "Hello! I'm your customer support agent. How can I help you today?",
            timestamp: new Date(),
          },
        ])
      }
    }

    loadMessages()
  }, [currentSessionId])

  const handleSubmit = async (e?: React.FormEvent, messageText?: string) => {
    e?.preventDefault()
    const text = messageText ?? input
    if (!text.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      const response = await chatAPI.sendMessage(text, currentSessionId || undefined)

      if (!currentSessionId && response.sessionId) {
        onSessionUpdate(response.sessionId)
      }

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: response.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== userMessage.id)
        return [...filtered, { ...userMessage, id: Date.now() - 1 }, aiMessage]
      })
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response'
      setError(errorMsg)

      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))

      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content:
          "I apologize, but I'm having trouble connecting to the server. Please check if the backend is running and try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }
  const handleQuickReply = (text: string) => {
    handleSubmit(undefined, text)
  }

  return (
    <div className="bg-background flex h-full w-full flex-col">
      <header className="bg-card shrink-0 border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 sm:h-10 sm:w-10">
              <Bot className="h-4 w-4 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="hidden flex-1 sm:block">
              <h1 className="text-lg font-semibold sm:text-xl">Azamon Support Agent</h1>
              <p className="text-muted-foreground hidden text-xs sm:block">
                {currentSessionId ? `Session: ${currentSessionId}` : 'New conversation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ToggleTheme />
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-destructive/10 border-destructive/20 border-b px-4 py-3">
          <div className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 md:px-6">
          {isLoadingHistory ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-muted-foreground">Loading conversation...</div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 sm:mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
              >
                <div
                  className={`flex max-w-[85%] gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                      message.role === 'ai'
                        ? 'bg-linear-to-br from-blue-500 to-purple-600'
                        : 'bg-secondary'
                    }`}
                  >
                    {message.role === 'ai' ? (
                      <Bot className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    ) : (
                      <User className="text-secondary-foreground h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border'
                      }`}
                    >
                      <div className="wrap-break-word whitespace-pre-wrap">{message.content}</div>
                    </div>
                    {message.id === 1 && message.role === 'ai' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {quickReplies.map((reply, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(reply)}
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}

                    {message.role === 'ai' && (
                      <div className="mt-2 ml-1 flex gap-2">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="hover:bg-accent rounded p-1.5 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4 dark:text-green-500" />
                          ) : (
                            <Copy className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="mb-4 flex gap-2 sm:mb-6 sm:gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 sm:h-8 sm:w-8">
                <Bot className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div className="bg-card rounded-2xl border px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-baseline gap-1">
                  <div>Agent is typing</div>
                  <div
                    className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full sm:h-2 sm:w-2"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full sm:h-2 sm:w-2"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full sm:h-2 sm:w-2"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-card shrink-0 border-t">
        <div className="mx-auto max-w-4xl px-3 py-3 sm:px-4 sm:py-4 md:px-6">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about shipping, returns, products..."
              className="bg-background focus:ring-ring placeholder:text-muted-foreground w-full resize-none rounded-xl border px-3 py-2 pr-10 text-sm focus:ring-2 focus:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
              style={{ maxHeight: '200px' }}
              rows={1}
            />
            {isTyping ? (
              <Button
                disabled
                className="bg-primary text-primary-foreground absolute right-1.5 bottom-1.5 rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:right-2 sm:bottom-2 sm:p-2"
              >
                <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isTyping}
                className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-1.5 bottom-1.5 rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:right-2 sm:bottom-2 sm:p-2"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-2 hidden text-center text-xs sm:block">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
