// src/components/settings/UserProfileComponent.tsx
"use client"

import { UserSettingsForm } from "./UserSettingsForm"
import { UpdateUserData } from "@/types/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserCog, Shield, Key, User as UserIcon, Info } from "lucide-react"
import { useUserProfile } from "@/hooks/useUserProfile"
import { UserAvatarUpload } from "./UserAvatarUpload"
import { ChangePasswordForm } from "./ChangePasswordForm"

const roleLabels = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  USER: "Usuário",
}

const roleVariants = {
  SUPER_ADMIN: "default",
  ADMIN: "default",
  MANAGER: "secondary",
  USER: "outline",
} as const

export function UserProfileComponent() {
  const {
    user,
    loading,
    submitting,
    updateProfile,
    changePassword,
    uploadAvatar,
  } = useUserProfile()

  const handleUpdate = async (data: UpdateUserData) => {
    try {
      await updateProfile(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      await changePassword(currentPassword, newPassword)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Perfil não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <Badge variant={roleVariants[user.role]}>
            {roleLabels[user.role]}
          </Badge>
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Foto de Perfil
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações Pessoais
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Personalize seu avatar no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAvatarUpload
                user={user}
                onUpload={handleAvatarUpload}
                isUploading={submitting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados cadastrais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSettingsForm
                user={user}
                onSubmit={handleUpdate}
                isSubmitting={submitting}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Detalhes sobre sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conta criada em:</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="font-medium">
                  {new Date(user.updatedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Altere sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm
                onSubmit={handlePasswordChange}
                isSubmitting={submitting}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}