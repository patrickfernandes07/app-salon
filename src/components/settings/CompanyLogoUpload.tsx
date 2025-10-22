
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Building2, Loader2 } from "lucide-react"
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

    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB')
      return
    }

    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    
    try {
      await onUpload(file)
      
    } catch (error) {
      
      setPreview(company.logo || null)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/50">
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
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
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Alterar Logo
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou GIF • Máximo 2MB
          </p>
          <p className="text-xs text-muted-foreground">
            Tamanho recomendado: 400x400px
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}