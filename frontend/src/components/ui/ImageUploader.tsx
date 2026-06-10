'use client'
{/* Componente: ImageUploader
   Propósito: Subida de imágenes: previsualización, arrastrar y soltar, URL */}
import { useRef, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value?: string | null
  onChange: (base64: string | null) => void
  className?: string
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Imagen del Producto</label>
      {preview ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-40 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
            dragOver
              ? 'border-[#6EEB83] bg-[#6EEB83]/5'
              : 'border-gray-300 dark:border-gray-600 hover:border-[#062B5B] dark:hover:border-[#6EEB83] hover:bg-gray-50 dark:hover:bg-gray-700/50'
          )}
        >
          <Camera className="w-8 h-8 text-gray-400" />
          <span className="text-xs text-gray-500 text-center px-2">
            Click o arrastra una imagen
          </span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  )
}
