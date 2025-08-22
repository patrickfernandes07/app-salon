// src/components/layout/MainLayout.tsx
'use client';

import { ReactNode } from 'react';
import { Bell, LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar, NavigationGroup } from './AppSidebar';

export interface MainLayoutProps {
  children: ReactNode;
  navigation: NavigationGroup[];
  pageTitle?: string;
  logo?: {
    icon?: LucideIcon;
    title: string;
    subtitle?: string;
  };
  userActions?: Array<{
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  }>;
  headerActions?: ReactNode;
  showNotifications?: boolean;
}

export function MainLayout({
  children,
  navigation,
  pageTitle,
  logo,
  userActions,
  headerActions,
  showNotifications = true,
}: MainLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar 
        navigation={navigation} 
        logo={logo}
        userActions={userActions}
      />
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-4">
            {pageTitle && (
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {headerActions}
            {showNotifications && (
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}