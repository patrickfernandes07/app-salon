// src/components/layout/AppSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, ChevronUp, Scissors } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth.context';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export interface AppSidebarProps {
  navigation: NavigationGroup[];
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
}

export function AppSidebar({ 
  navigation, 
  logo = {
    icon: Scissors,
    title: 'Barbershop',
    subtitle: 'Manager'
  },
  userActions = []
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      SUPER_ADMIN: 'Super Administrador',
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      USER: 'Usuário'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const isActiveItem = (item: NavigationItem): boolean => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return pathname.startsWith(item.href) && item.href !== '/';
  };

  const LogoIcon = logo.icon;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          {LogoIcon && (
            <div className="bg-primary rounded-lg p-2">
              <LogoIcon className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {logo.title}
            </h1>
            {logo.subtitle && (
              <p className="text-xs text-gray-500">
                {logo.subtitle}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveItem(item);
                  
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        disabled={item.disabled}
                      >
                        <Link href={item.disabled ? '#' : item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name ? getUserInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.role ? getRoleLabel(user.role) : ''}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">
                        {user?.name ? getUserInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Ações customizadas */}
                {userActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <DropdownMenuItem key={index} onClick={action.onClick}>
                      <ActionIcon className="mr-2 h-4 w-4" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
                
                {userActions.length > 0 && <DropdownMenuSeparator />}
                
                <DropdownMenuItem onClick={handleLogout}>
                  <span className="mr-2">🚪</span>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}