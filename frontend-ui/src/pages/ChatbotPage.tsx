import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2, Paperclip, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatbotPage() {
  // Load messages from localStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatbot_messages')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      } catch (e) {
        console.error('Failed to parse saved messages:', e)
      }
    }
    // Default welcome message
    return [
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your Carbon Intelligence AI assistant. I can help you understand your emissions data, analyze trends, and provide recommendations. You can also upload documents (PDF, TXT, MD) to add to my knowledge base. What would you like to know?',
        timestamp: new Date()
      }
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatbot_messages', JSON.stringify(messages))
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    
    const uploadMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `📎 Uploading document: ${file.name}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, uploadMessage])

    try {
      const formData = new FormData()
      formData.append('file', file)

      await axios.post('http://localhost:4000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ Successfully uploaded "${file.name}"! I've added this document to my knowledge base. You can now ask me questions about its content.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Failed to upload "${file.name}". Please make sure the RAG service is running on port 4000.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setAttachedFile(null)
    }
  }

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return

    // Handle file upload if attached
    if (attachedFile) {
      await handleFileUpload(attachedFile)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call RAG service API
      const response = await axios.post('http://localhost:4000/api/chat', {
        message: input,
        context: 'carbon_emissions'
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'I apologize, but I couldn\'t process that request. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m currently unable to connect to the AI service. Here are some things I can help with:\n\n• Analyze emission trends\n• Explain hotspots\n• Provide reduction strategies\n• Answer questions about your data\n• Upload documents to my knowledge base\n\nPlease try again in a moment.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    'Why are my emissions high today?',
    'Which supplier has the highest CO₂?',
    'How can I reduce emissions by 20%?',
    'Explain the forecast for next week'
  ]

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <p className="text-white/60 mt-1">Ask me anything about your carbon emissions</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden rounded-xl shadow-lg dark:shadow-none backdrop-blur-xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="text-purple-400 animate-spin" />
                  <span className="text-white/70 text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-white/60 text-sm mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400" />
              Try asking:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg text-sm text-white/80 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          {/* Attached File Preview */}
          {attachedFile && (
            <div className="mb-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                <div>
                  <div className="text-white text-sm font-semibold">{attachedFile.name}</div>
                  <div className="text-white/60 text-xs">{(attachedFile.size / 1024).toFixed(2)} KB</div>
                </div>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setAttachedFile(file)
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-500/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach document"
            >
              <Paperclip size={20} className="text-white/70" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={attachedFile ? "Add a message (optional)..." : "Ask me anything about your emissions..."}
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-white/40">
              📎 Attach PDF, TXT, MD files • Press Enter to send
            </p>
            <p className="text-xs text-emerald-400/60">
              💡 I have access to your emissions database
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
