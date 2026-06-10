import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Pesan wajib diisi' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })
    
    const systemPrompt = `Kamu adalah Warpin AI, asisten keuangan warung kelontong yang berbasis syariah Islam.

Instruksi:
- Jawab dalam bahasa Indonesia yang sederhana dan ramah
- Fokus pada: akuntansi warung, hukum Islam muamalah (akad qardh, riba, zakat tijarah), tips mengelola warung
- Jawab maksimal 3 paragraf, tidak perlu terlalu panjang
- Gunakan emoji yang sesuai
- Jika ditanya soal lain, tanyakan kembali tentang topik warung/keuangan

Mulai percakapan dengan salam ramah jika belum pernah chat sebelumnya.`

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Baik, saya Warpin AI. Siap membantu keuangan warung kamu! 😊' }],
        },
      ],
    })

    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Error Warpin AI:', error)
    return NextResponse.json(
      { error: 'Maaf, terjadi kesalahan. Coba lagi nanti ya!' },
      { status: 500 }
    )
  }
}