// src/hooks/useNavigation.ts
"use client";

import {
  NavigationItem,
  navigation,
  userActions,
} from "@/app/config/navigation";
import { usePathname, useRouter } from "next/navigation";

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Verifica se um item está ativo
  const isActiveItem = (item: NavigationItem): boolean => {
    if (item.href === pathname) return true;

    // Para rotas aninhadas, verifica se o pathname começa com o href do item
    // Mas evita falsos positivos (ex: /dashboard não deve marcar /dashboard/settings como ativo)
    if (item.href !== "/" && pathname.startsWith(item.href)) {
      // Se o item href é exatamente igual ao pathname, é ativo
      if (item.href === pathname) return true;

      // Se o próximo caractere após o href for uma barra, é uma subrota
      const nextChar = pathname[item.href.length];
      return nextChar === "/" || nextChar === "?" || nextChar === "#";
    }

    return false;
  };

  // Navega para uma rota
  const navigateTo = (href: string, external = false) => {
    if (external) {
      window.open(href, "_blank");
    } else {
      router.push(href);
    }
  };

  // Executa ação do usuário
  const executeUserAction = (actionId: string) => {
    const action = userActions.find((a) => a.id === actionId);
    if (!action) return;

    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigateTo(action.href);
    }
  };

  // Encontra um item por ID
  const findItemById = (id: string): NavigationItem | undefined => {
    for (const group of navigation) {
      const item = group.items.find((item) => item.id === id);
      if (item) return item;
    }
    return undefined;
  };

  // Encontra o grupo ativo atual
  const getActiveGroup = () => {
    for (const group of navigation) {
      const hasActiveItem = group.items.some((item) => isActiveItem(item));
      if (hasActiveItem) return group;
    }
    return null;
  };

  // Obtém breadcrumbs baseado na rota atual
  const getBreadcrumbs = () => {
    const activeGroup = getActiveGroup();
    const activeItem = activeGroup?.items.find((item) => isActiveItem(item));

    const breadcrumbs = [];

    if (activeGroup) {
      breadcrumbs.push({
        label: activeGroup.label,
        href: "#",
        active: false,
      });
    }

    if (activeItem) {
      breadcrumbs.push({
        label: activeItem.name,
        href: activeItem.href,
        active: true,
      });
    }

    return breadcrumbs;
  };

  return {
    navigation,
    userActions,
    pathname,
    isActiveItem,
    navigateTo,
    executeUserAction,
    findItemById,
    getActiveGroup,
    getBreadcrumbs,
  };
}
