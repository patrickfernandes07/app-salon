// src/components/settings/SettingsComponent.tsx
"use client"

import { useCompanySettings } from "@/hooks/useCompanySettings"
import { CompanySettingsForm } from "./CompanySettingsForm"
import { CompanyLogoUpload } from "./CompanyLogoUpload"
import { UpdateCompanyData } from "@/types/company"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Crown } from "lucide-react"

const planLabels = {
  BASIC: "Básico",
  PREMIUM: "Premium",
  ENTERPRISE: "Empresarial",
}

const planVariants = {
  BASIC: "secondary",
  PREMIUM: "default",
  ENTERPRISE: "default",
} as const

export function SettingsComponent() {
  const companyId = 1 // Provisório - pegar do contexto/auth depois
  
  const {
    company,
    loading,
    submitting,
    updateCompany,
    uploadLogo,
  } = useCompanySettings(companyId)

  const handleUpdate = async (data: UpdateCompanyData) => {
    try {
      await updateCompany(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogoUpload = async (file: File) => {
    try {
      await uploadLogo(file)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Empresa não encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie as informações da sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <Badge variant={planVariants[company.plan]}>
            Plano {planLabels[company.plan]}
          </Badge>
          <Badge variant={company.isActive ? "default" : "secondary"}>
            {company.isActive ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo da Empresa</CardTitle>
          <CardDescription>
            Personalize a identidade visual da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyLogoUpload
            company={company}
            onUpload={handleLogoUpload}
            isUploading={submitting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Atualize os dados cadastrais da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySettingsForm
            company={company}
            onSubmit={handleUpdate}
            isSubmitting={submitting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes sobre sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Conta criada em:</span>
            <span className="font-medium">
              {new Date(company.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Última atualização:</span>
            <span className="font-medium">
              {new Date(company.updatedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}