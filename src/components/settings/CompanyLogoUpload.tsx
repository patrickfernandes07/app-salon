// src/components/settings/CompanyLogoUpload.tsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Building2 } from "lucide-react"
import { Company } from "@/types/company"

interface CompanyLogoUploadProps {
  company: Company
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export function CompanyLogoUpload({ 
  company, 
  onUpload, 
  isUploading 
}: CompanyLogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(company.logo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    try {
      await onUpload(file)
    } catch (error) {
      // Reverter preview em caso de erro
      setPreview(company.logo || null)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Logo da Empresa</h3>
        <p className="text-sm text-muted-foreground">
          Tamanho recomendado: 400x400px. Máximo: 2MB
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/50">
          {preview ? (
            <img
              src={preview}
              alt="Logo da empresa"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Enviando..." : "Alterar Logo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou GIF
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}