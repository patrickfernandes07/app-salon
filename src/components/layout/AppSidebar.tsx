// src/components/layout/AppSidebar.tsx
'use client';

import Link from 'next/link';
import { ChevronUp, LogOut } from 'lucide-react';

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
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
import { brandConfig } from '@/app/config/navigation';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { navigation, userActions, isActiveItem, navigateTo } = useNavigation();

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

  const LogoIcon = brandConfig.logo.icon;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="bg-primary rounded-lg p-2">
            <LogoIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              {brandConfig.logo.title}
            </h1>
            {brandConfig.logo.subtitle && (
              <p className="text-xs text-sidebar-foreground/60">
                {brandConfig.logo.subtitle}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveItem(item);
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        asChild={!item.disabled}
                        isActive={isActive}
                        disabled={item.disabled}
                        className={cn(
                          item.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {item.disabled ? (
                          <div className="flex items-center gap-2 w-full">
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Link 
                            href={item.href}
                            onClick={(e) => {
                              if (item.external) {
                                e.preventDefault();
                                navigateTo(item.href, true);
                              }
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )}
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
                
                {/* Ações do usuário */}
                {userActions.map((action) => {
                  if (action.separator) {
                    return <DropdownMenuSeparator key={action.id} />;
                  }

                  const ActionIcon = action.icon;
                  return (
                    <DropdownMenuItem 
                      key={action.id} 
                      onClick={() => {
                        if (action.onClick) {
                          action.onClick();
                        } else if (action.href) {
                          navigateTo(action.href);
                        }
                      }}
                    >
                      <ActionIcon className="mr-2 h-4 w-4" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
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