'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconSend, IconRobot, IconUser } from '@tabler/icons-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'Apa itu zakat tijarah?',
  'Apa itu akad qardh?',
  'Cara baca laporan neraca?',
  'Tips kelola keuangan warung?',
  'Kenapa harus catat keuangan?',
]

export default function WarpinAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Assalamu'alaikum! Saya Warpin AI, asisten keuangan warung kamu yang berbasis syariah. 😊\n\nAda yang bisa saya bantu hari ini?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text?: string) {
    const msg = text || input
    if (!msg.trim()) return

    const userMessage: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Instruksi sistem agar AI merespons dengan ringkas
      const promptInstruksi = "\n\n(Penting: Jawab pertanyaan di atas dengan sesingkat, sepadat, dan sejelas mungkin. Jangan bertele-tele. Berikan langsung ke intinya agar mudah dipahami oleh pedagang/pemilik warung.)"

      const response = await fetch('/api/warpin-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg + promptInstruksi })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Coba lagi ya! 😊'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">

      {/* Menghilangkan scrollbar bawaan browser untuk class scrollbar-hide */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#B8860B] to-[#D4A017] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <IconRobot size={22} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Warpin AI</p>
          <p className="text-white/75 text-xs">Asisten keuangan syariah 24/7</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                <IconRobot size={16} color="white" />
              </div>
            )}
            <div className={`max-w-xs rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-[#1B4F3A] text-white rounded-br-sm'
                : 'bg-white text-gray-700 rounded-bl-sm shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-[#1B4F3A] rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                <IconUser size={16} color="white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center flex-shrink-0">
              <IconRobot size={16} color="white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 hover:border-[#B8860B] hover:text-[#B8860B] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-8 pt-2">
        <div className="flex gap-2 items-center bg-white rounded-2xl shadow-sm px-4 py-2 border border-gray-200">
          <input
            type="text"
            placeholder="Ketik pertanyaan kamu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 text-sm focus:outline-none text-gray-700 py-2"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-9 h-9 bg-[#B8860B] rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#9a7009] transition-colors flex-shrink-0"
          >
            <IconSend size={16} color="white" />
          </button>
        </div>
      </div>

    </main>
  )
}