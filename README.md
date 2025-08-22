# 🔥 Barbershop Frontend

Sistema de gestão para barbearias e salões - Interface Web

## 🚀 **Tecnologias**

- **Next.js 14** - Framework React
- **TypeScript** - Linguagem tipada
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Zod** - Validação de esquemas

## 📦 **Instalação**

### 1. Clone e instale as dependências
```bash
git clone <repo-url>
cd barbershop-frontend
npm install
```

### 2. Configure variáveis de ambiente
```bash
# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
```

### 3. Instalar e configurar Shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button input label card form toast dropdown-menu avatar
```

### 4. Executar aplicação
```bash
npm run dev
```

Acesse: http://localhost:3001

## 🏗️ **Estrutura do Projeto**

```
src/
├── app/                    # App Router do Next.js
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard protegida
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes do Shadcn/ui
│   └── auth/             # Componentes de autenticação
├── contexts/              # Contexts do React
│   └── auth.context.tsx  # Context de autenticação
├── services/              # Serviços da API
│   ├── api.ts            # Service base da API
│   └── auth.service.ts   # Service de autenticação
└── middleware.ts          # Middleware do Next.js
```

## 🔐 **Sistema de Autenticação**

### **Fluxo de Autenticação**

1. **Login**: Usuário faz login com email/senha
2. **Tokens**: Sistema recebe access token e refresh token
3. **Armazenamento**: Tokens salvos no sessionStorage
4. **Interceptors**: Axios adiciona token automaticamente
5. **Refresh**: Token renovado automaticamente quando expira
6. **Proteção**: Rotas protegidas por AuthGuard

### **Credenciais de Teste**
```
Admin:
Email: admin@barbeariavip.com
Senha: admin123

Gerente:
Email: manager@barbeariavip.com  
Senha: manager123
```

## 🛡️ **Proteção de Rotas**

### **AuthGuard Component**
```tsx
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// Com verificação de roles
<AuthGuard roles={['ADMIN', 'MANAGER']}>
  <AdminContent />
</AuthGuard>
```

### **Hook useAuth**
```tsx
const { user, isAuthenticated, login, logout, loading } = useAuth();
```

## 📱 **Principais Funcionalidades**

### **✅ Implementado**
- [x] Sistema de login responsivo
- [x] Autenticação com JWT
- [x] Refresh token automático
- [x] Proteção de rotas
- [x] Dashboard com dados mock
- [x] Context de autenticação
- [x] Interceptors HTTP
- [x] Gerenciamento de estado
- [x] UI/UX moderna

### **🚧 Próximas Features**
- [ ] Gestão de clientes
- [ ] Sistema de agendamentos
- [ ] Catálogo de serviços
- [ ] Gestão de profissionais
- [ ] Relatórios e dashboards
- [ ] Configurações da empresa

## 🎨 **Design System**

### **Cores Principais**
- **Primary**: Azul (#3B82F6)
- **Secondary**: Cinza (#6B7280)
- **Success**: Verde (#10B981)
- **Warning**: Amarelo (#F59E0B)
- **Error**: Vermelho (#EF4444)

### **Componentes Shadcn/ui**
- Button, Input, Label
- Card, Alert, Avatar
- DropdownMenu, Form, Toast

## 🔧 **Configuração Avançada**

### **Axios Interceptors**
- Adiciona token automaticamente
- Renova token quando expira
- Redireciona para login em caso de erro

### **TypeScript**
- Tipagem completa da API
- Interfaces bem definidas
- Validação em tempo de compilação

### **Zod Validation**
- Validação de formulários
- Schemas type-safe
- Mensagens de erro personalizadas

## 🧪 **Como Testar**

### **1. Teste de Login**
1. Acesse http://localhost:3001
2. Use credenciais: admin@barbeariavip.com / admin123
3. Deve redirecionar para dashboard

### **2. Teste de Proteção**
1. Acesse diretamente /dashboard sem estar logado
2. Deve redirecionar para /login
3. Após login, deve voltar para /dashboard

### **3. Teste de Tokens**
1. Faça login
2. Abra DevTools > Application > Session Storage
3. Verifique se accessToken e refreshToken estão salvos

### **4. Teste de Logout**
1. Na dashboard, clique no avatar do usuário
2. Clique em "Sair"
3. Deve limpar tokens e redirecionar para login

## 📚 **Scripts Disponíveis**

```bash
npm run dev        # Desenvolvimento
npm run build      # Build de produção
npm run start      # Executar build
npm run lint       # Verificar código
```

## 🔗 **Integração com Backend**

### **Base URL**
- Desenvolvimento: http://localhost:3000
- Configurado via NEXT_PUBLIC_API_URL

### **Endpoints Utilizados**
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `GET /users/me` - Dados do usuário

### **Headers**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

## 🚨 **Notas Importantes**

1. **sessionStorage**: Tokens armazenados no sessionStorage (limpa ao fechar aba)
2. **Middleware**: Configurado mas validação real é client-side
3. **TypeScript**: Strict mode habilitado
4. **Responsive**: Interface adaptável para mobile
5. **Performance**: Lazy loading e otimizações do Next.js

## 🐛 **Troubleshooting**

### **Erro de CORS**
```bash
# Verificar se backend está com CORS habilitado
# Backend deve permitir origin: http://localhost:3001
```

### **Token não renovando**
```bash
# Verificar se refresh token está válido
# Verificar endpoint /auth/refresh no backend
```

### **Redirecionamento infinito**
```bash
# Verificar se AuthGuard não está em loop
# Verificar middleware.ts
```