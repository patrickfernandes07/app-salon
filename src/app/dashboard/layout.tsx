// src/app/dashboard/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Scissors } from 'lucide-react';

import AuthGuard from '@/components/auth/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { dashboardNavigation, userActions } from '@/config/dashboard-navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    // Buscar o título da página baseado na rota atual
    for (const group of dashboardNavigation) {
      const item = group.items.find(item => item.href === pathname);
      if (item) return item.name;
    }
    return 'Dashboard';
  };

  return (
    <AuthGuard>
      <MainLayout
        navigation={dashboardNavigation}
        pageTitle={getPageTitle()}
        logo={{
          icon: Scissors,
          title: 'Barbershop',
          subtitle: 'Manager'
        }}
        userActions={userActions}
        showNotifications={true}
      >
        {children}
      </MainLayout>
    </AuthGuard>
  );
}