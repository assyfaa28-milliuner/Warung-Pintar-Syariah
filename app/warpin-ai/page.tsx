'use client'

import { useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function WarpinAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Assalamu\'alaikum! Saya Warpin AI, asisten keuangan warung syariah kamu. Ada yang bisa saya bantu? 😊'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/warpin-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply
      }
      setMessages(prev => [...prev, assistantMessage])

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
    <main className="min-h-screen bg-gray-100 flex flex-col pb-24">

      {/* Header */}
      <div className="bg-[#B8860B] text-white px-4 py-5 flex items-center gap-3">
        <a href="/dashboard" className="text-white text-2xl">←</a>
        <div>
          <h1 className="text-xl font-bold">🎙️ Warpin AI</h1>
          <p className="text-sm opacity-80">Asisten keuangan syariah 24/7</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-sm">🕌</span>
              </div>
            )}
            <div
              className={`max-w-xs rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-[#1B4F3A] text-white rounded-tr-none'
                  : 'bg-white text-gray-700 rounded-tl-none shadow'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">🕌</span>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow">
              <p className="text-gray-400 text-sm">Warpin AI sedang mengetik...</p>
            </div>
          </div>
        )}
      </div>

      {/* Contoh Pertanyaan */}
      <div className="px-4 pb-2">
        <p className="text-xs text-gray-400 mb-2">💡 Coba tanya:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            'Apa itu zakat tijarah?',
            'Apa itu akad qardh?',
            'Cara baca laporan neraca?',
            'Tips kelola keuangan warung?'
          ].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 hover:border-[#B8860B] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 bg-white rounded-2xl shadow p-2">
          <input
            type="text"
            placeholder="Ketik pertanyaan kamu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 text-sm focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-[#B8860B] text-white px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-[#9a7009] transition-colors"
          >
            Kirim
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">🏠</span>
          <span className="text-xs">Beranda</span>
        </a>
        <a href="/laporan" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📊</span>
          <span className="text-xs">Laporan</span>
        </a>
        <a href="/warpin-ai" className="flex flex-col items-center">
          <div className="bg-[#B8860B] rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg">
            <span className="text-2xl">🎙️</span>
          </div>
          <span className="text-xs text-[#B8860B] font-semibold mt-1">Warpin AI</span>
        </a>
        <a href="/neraca" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">⚖️</span>
          <span className="text-xs">Neraca</span>
        </a>
        <a href="/akademi" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📚</span>
          <span className="text-xs">Akademi</span>
        </a>
      </div>

    </main>
  )
}