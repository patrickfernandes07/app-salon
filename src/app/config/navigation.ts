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
        href: "/professionals",
        icon: User,
      },
      {
        id: "services",
        name: "Serviços",
        href: "/services",
        icon: Scissors,
      },
      {
        id: "products",
        name: "Produtos",
        href: "/products",
        icon: Package,
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
        href: "/transactions",
        icon: DollarSign,
      },
      {
        id: "reports",
        name: "Relatórios",
        href: "/reports",
        icon: BarChart3,
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
        href: "/settings",
        icon: Settings,
      },
      {
        id: "users",
        name: "Usuários",
        href: "/users",
        icon: Shield,
      },
      // {
      //   id: "logs",
      //   name: "Logs do Sistema",
      //   href: "/logs",
      //   icon: FileText,
      //   disabled: true,
      //   badge: "Em breve",
      // },
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
    id: "account-settings",
    label: "Configurações da Conta",
    icon: Settings,
    href: "/profile",
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
