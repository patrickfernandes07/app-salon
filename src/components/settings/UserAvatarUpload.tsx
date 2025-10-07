// src/components/settings/UserAvatarUpload.tsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User as UserIcon } from "lucide-react"
import { User } from "@/types/user"

interface UserAvatarUploadProps {
  user: User
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export function UserAvatarUpload({ 
  user, 
  onUpload, 
  isUploading 
}: UserAvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(user.avatar || null)
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
      setPreview(user.avatar || null)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Foto de Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Tamanho recomendado: 400x400px. Máximo: 2MB
        </p>
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview || undefined} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Enviando..." : "Alterar Foto"}
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