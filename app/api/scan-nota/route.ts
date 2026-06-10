import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image diperlukan' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

    const prompt = `Analisis foto struk/nota belanja ini. Ekstrak data setiap barang yang terlihat.

KEMBALIKAN RESPONSE DALAM FORMAT INI SAJA (JSON pure, tanpa text lain):
{
  "items": [
    {"name": "nama barang", "price": 20600, "quantity": 1},
    {"name": "barang lain", "price": 5000, "quantity": 2}
  ],
  "total": 25600,
  "store": "nama toko atau kosong"
}

RULES:
- price dan quantity hanya angka (20600, bukan "Rp 20.600")
- Hapus discount dari total jika ada
- Jika tidak bisa read, return {"items": [], "total": 0}
- JANGAN TAMBAH TEXT SEBELUM ATAU SESUDAH JSON`

    const response = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
      { text: prompt },
    ])

    const responseText = response.response.text().trim()
    console.log('=== SCAN NOTA DEBUG ===')
    console.log('Raw Response:', responseText)

    // Coba parse JSON
    let data = null
    
    // Method 1: Cari JSON block dalam response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        data = JSON.parse(jsonMatch[0])
        console.log('Parsed data:', data)
      } catch (e) {
        console.error('JSON parse error:', e)
      }
    }

    // Jika berhasil parse dan ada items
    if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
      // Filter valid items
      const validItems = data.items.filter((item: any) => 
        item.name && 
        typeof item.price === 'number' && 
        item.price > 0 &&
        typeof item.quantity === 'number' && 
        item.quantity > 0
      )

      if (validItems.length > 0) {
        return NextResponse.json({
          items: validItems,
          total: data.total || validItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0),
          store: data.store || '',
        })
      }
    }

    // Jika parse gagal atau tidak ada items
    console.log('Failed to extract items. Returning empty.')
    return NextResponse.json({
      items: [],
      total: 0,
      store: '',
      error: 'Tidak bisa membaca struk. Coba foto yang lebih terang dan tidak blur.',
    })

  } catch (error) {
    console.error('Error scan nota:', error)
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan server.',
        items: [],
      },
      { status: 500 }
    )
  }
}