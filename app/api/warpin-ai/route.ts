import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  const { message } = await request.json()

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2,5',
      systemInstruction: `Kamu adalah Warpin AI, asisten keuangan warung kelontong berbasis syariah di Indonesia.
Bantu pemilik warung memahami keuangan mereka dengan bahasa yang sangat sederhana dan ramah.
Hindari istilah teknis akuntansi. Gunakan bahasa sehari-hari Bahasa Indonesia.
Topik yang bisa dijawab: fitur Warpin, laporan keuangan sederhana, zakat tijarah, akad qardh, tips kelola warung.
Maksimal 3 paragraf per jawaban. Selalu awali dengan sapaan hangat seperti "Halo Kak!" atau "Tentu Kak!".`
    })

    const result = await model.generateContent(message)
    const reply = result.response.text()

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Gemini AI error:', error)
    return NextResponse.json({
      reply: 'Maaf Kak, Warpin AI sedang tidak bisa dihubungi. Coba lagi sebentar ya! 😊'
    })
  }
}