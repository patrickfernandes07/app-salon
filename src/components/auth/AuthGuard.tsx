// src/components/auth/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: string[];
}

export default function AuthGuard({ 
  children, 
  fallback = <div>Carregando...</div>,
  roles = []
}: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Verificar permissões por role se especificado
      if (roles.length > 0 && user) {
        const hasPermission = roles.includes(user.role);
        if (!hasPermission) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [isAuthenticated, loading, user, router, roles]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Se não está autenticado, mostrar fallback ou nada
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Verificar permissões
  if (roles.length > 0 && user) {
    const hasPermission = roles.includes(user.role);
    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}