// src/config/dashboard-navigation.ts
import {
  Home,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  Settings,
  User,
  BarChart3,
  Package,
  FileText,
  Shield,
} from "lucide-react";
import { NavigationGroup } from "@/components/layout/AppSidebar";

export const dashboardNavigation: NavigationGroup[] = [
  {
    label: "Principal",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        name: "Clientes",
        href: "/dashboard/customers",
        icon: Users,
        disabled: true,
        badge: "Em breve",
      },
      {
        name: "Profissionais",
        href: "/dashboard/professionals",
        icon: User,
        disabled: true,
        badge: "Em breve",
      },
      {
        name: "Serviços",
        href: "/dashboard/services",
        icon: Scissors,
        disabled: true,
        badge: "Em breve",
      },
      {
        name: "Produtos",
        href: "/dashboard/products",
        icon: Package,
        disabled: true,
        badge: "Em breve",
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        name: "Transações",
        href: "/dashboard/transactions",
        icon: DollarSign,
        disabled: true,
        badge: "Em breve",
      },
      {
        name: "Relatórios",
        href: "/dashboard/reports",
        icon: BarChart3,
        disabled: true,
        badge: "Em breve",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        name: "Configurações",
        href: "/dashboard/settings",
        icon: Settings,
        disabled: true,
        badge: "Em breve",
      },
      {
        name: "Logs",
        href: "/dashboard/logs",
        icon: FileText,
        disabled: true,
        badge: "Em breve",
      },
      {
        name: "Usuários",
        href: "/dashboard/users",
        icon: Shield,
        disabled: true,
        badge: "Em breve",
      },
    ],
  },
];

// Ações do usuário no dropdown
export const userActions = [
  {
    label: "Perfil",
    icon: User,
    onClick: () => {
      // TODO: Implementar navegação para perfil
      console.log("Navegar para perfil");
    },
  },
  {
    label: "Configurações",
    icon: Settings,
    onClick: () => {
      // TODO: Implementar navegação para configurações
      console.log("Navegar para configurações");
    },
  },
];
