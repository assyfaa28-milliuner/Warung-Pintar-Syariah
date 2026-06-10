'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconCamera, IconUpload, IconDeviceFloppy, IconX, IconPlus, IconTrash } from '@tabler/icons-react'

type ScannedItem = {
  name: string
  price: number
  quantity: number
}

export default function ScanNota() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [items, setItems] = useState<ScannedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'upload' | 'preview' | 'edit'>('upload')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(f)
  }

  async function handleAnalyze() {
    if (!file) { setMessage('❌ Pilih foto dulu!'); return }

    setLoading(true)
    setMessage('')

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1]

        const response = await fetch('/api/scan-nota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        })

        const data = await response.json()

        if (data.items && data.items.length > 0) {
          setItems(data.items)
          setStep('preview')
          setMessage('✅ Struk berhasil di-scan! Review data di bawah.')
        } else {
          setMessage('❌ Tidak bisa membaca struk. Coba foto yang lebih jelas!')
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setMessage('❌ Terjadi kesalahan saat scan.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (items.length === 0) { setMessage('❌ Tidak ada barang untuk disimpan!'); return }

    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }

      // Simpan setiap item sebagai transaksi
      for (const item of items) {
        const total = item.price * item.quantity

        await supabase.from('transactions').insert({
          warung_id: user.id,
          type: 'purchase',
          description: `Scan nota - ${item.name} (${item.quantity} pcs)`,
          amount: total,
        })

        // Update atau create inventory
        const { data: existing } = await supabase
          .from('inventory')
          .select('*')
          .eq('warung_id', user.id)
          .eq('item_name', item.name)
          .single()

        if (existing) {
          await supabase
            .from('inventory')
            .update({
              quantity: existing.quantity + item.quantity,
              hpp: item.price,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        } else {
          await supabase.from('inventory').insert({
            warung_id: user.id,
            item_name: item.name,
            hpp: item.price,
            quantity: item.quantity,
          })
        }
      }

      setMessage('✅ Struk berhasil disimpan! Stok terupdate otomatis.')
      setTimeout(() => {
        setFile(null)
        setPreview('')
        setItems([])
        setStep('upload')
      }, 2000)

    } catch {
      setMessage('❌ Gagal menyimpan struk.')
    } finally {
      setLoading(false)
    }
  }

  function updateItem(index: number, field: keyof ScannedItem, value: any) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  function deleteItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function addItem() {
    setItems([...items, { name: '', price: 0, quantity: 1 }])
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-20">

      {/* Header */}
      <div className="bg-yellow-500 px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconCamera size={20} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Scan Nota</p>
          <p className="text-white/70 text-xs">Foto struk & otomatis input stok</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto">
                <IconCamera size={32} color="#CA8A04" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Upload Foto Struk</p>
              <p className="text-xs text-gray-400">Ambil foto struk/nota belanja kamu</p>
              
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl py-6 px-4 cursor-pointer hover:bg-yellow-100 transition">
                  <IconUpload size={28} color="#CA8A04" className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-yellow-700">Klik untuk ambil foto</p>
                  <p className="text-xs text-yellow-600 mt-1">dari Kamera atau Galeri HP</p>
                </div>
              </label>

              {file && (
                <p className="text-xs text-green-600 font-semibold">✅ {file.name} dipilih</p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="w-full bg-yellow-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <IconCamera size={18} />
                {loading ? 'Scanning...' : 'Scan Nota'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Preview */}
        {step === 'preview' && preview && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={preview} alt="Struk" className="w-full h-auto" />
            </div>
            <button
              onClick={() => setStep('edit')}
              className="w-full bg-[#1B4F3A] text-white py-3 rounded-xl font-semibold text-sm"
            >
              Lanjut ke Edit Data →
            </button>
            <button
              onClick={() => { setStep('upload'); setPreview('') }}
              className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm"
            >
              Upload Foto Lain
            </button>
          </div>
        )}

        {/* STEP 3: Edit & Save */}
        {step === 'edit' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold text-gray-500 mb-3">Daftar Barang (Bisa diedit)</p>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-200">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nama Barang</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
                        placeholder="Nama barang"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Harga</label>
                        <input
                          type="number"
                          value={item.price === 0 ? '' : item.price} // <-- Angka 0 mudah dihapus
                          onChange={(e) => updateItem(i, 'price', e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
                          placeholder="0"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity === 0 ? '' : item.quantity} // <-- Angka 0 mudah dihapus
                          onChange={(e) => updateItem(i, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
                          placeholder="1"
                        />
                      </div>
                      <button
                        onClick={() => deleteItem(i)}
                        className="mt-6 text-red-500 hover:text-red-700"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Total: Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={addItem}
                className="w-full mt-3 border border-dashed border-gray-300 text-gray-600 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <IconPlus size={16} />
                Tambah Barang Manual
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <p className="text-sm font-bold text-blue-700 mb-2">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-blue-800">
                Rp {items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString('id-ID')}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || items.length === 0}
              className="w-full bg-[#1B4F3A] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#163d2d] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <IconDeviceFloppy size={18} />
              {loading ? 'Menyimpan...' : 'Simpan Semua Barang'}
            </button>

            <button
              onClick={() => { setStep('preview') }}
              className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm"
            >
              Kembali ke Preview
            </button>
          </div>
        )}

        {/* Notifikasi */}
        {message && (
          <div className={`rounded-2xl p-4 shadow-sm ${message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm font-semibold ${message.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}