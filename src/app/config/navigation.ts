// src/config/navigation.ts
import {
  Home,
  Users,
  Scissors,
  DollarSign,
  Settings,
  User,
  BarChart3,
  Package,
  FileText,
  Shield,
  Clock,
  LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
  external?: boolean;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const navigation: NavigationGroup[] = [
  {
    id: "main",
    label: "Principal",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    id: "management",
    label: "Gestão",
    items: [
      {
        id: "customers",
        name: "Clientes",
        href: "/customers",
        icon: Users,
      },
      {
        id: "professionals",
        name: "Profissionais",
        href: "/dashboard/professionals",
        icon: User,
        disabled: true,
        badge: "Em breve",
      },
      {
        id: "services",
        name: "Serviços",
        href: "/dashboard/services",
        icon: Scissors,
        disabled: true,
        badge: "Em breve",
      },
      {
        id: "products",
        name: "Produtos",
        href: "/dashboard/products",
        icon: Package,
        disabled: true,
        badge: "Em breve",
      },
    ],
  },
  {
    id: "financial",
    label: "Financeiro",
    items: [
      {
        id: "transactions",
        name: "Transações",
        href: "/dashboard/transactions",
        icon: DollarSign,
        disabled: true,
        badge: "Em breve",
      },
      {
        id: "reports",
        name: "Relatórios",
        href: "/dashboard/reports",
        icon: BarChart3,
        disabled: true,
        badge: "Em breve",
      },
    ],
  },
  {
    id: "system",
    label: "Sistema",
    items: [
      {
        id: "settings",
        name: "Configurações",
        href: "/dashboard/settings",
        icon: Settings,
        disabled: true,
        badge: "Em breve",
      },
      {
        id: "users",
        name: "Usuários",
        href: "/dashboard/users",
        icon: Shield,
        disabled: true,
        badge: "Em breve",
      },
      {
        id: "logs",
        name: "Logs do Sistema",
        href: "/dashboard/logs",
        icon: FileText,
        disabled: true,
        badge: "Em breve",
      },
    ],
  },
];

// Configurações do usuário no dropdown
export interface UserAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  separator?: boolean;
}

export const userActions: UserAction[] = [
  {
    id: "profile",
    label: "Meu Perfil",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    id: "account-settings",
    label: "Configurações da Conta",
    icon: Settings,
    href: "/dashboard/account",
  },
  {
    id: "separator-1",
    label: "",
    icon: User, // Não usado
    separator: true,
  },
  {
    id: "working-hours",
    label: "Meus Horários",
    icon: Clock,
    href: "/dashboard/my-schedule",
  },
];

// Configurações da logo/brand
export const brandConfig = {
  name: "Barbershop Manager",
  shortName: "BSM",
  logo: {
    icon: Scissors,
    title: "Barbershop",
    subtitle: "Manager",
  },
};
