// src/components/layout/LayoutWrapper.tsx
'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from "@/components/layout/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Rotas que NÃO devem ter sidebar
const NO_SIDEBAR_ROUTES = ['/login', '/register', '/forgot-password']

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  const shouldHideSidebar = NO_SIDEBAR_ROUTES.some(route => pathname.startsWith(route))

  if (shouldHideSidebar) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* Breadcrumb removido temporariamente para evitar erro de hidratação */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}