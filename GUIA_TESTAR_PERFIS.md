# 🧪 Guia de Testes - Mudando de Perfil

## 🎯 Como Testar Todos os Perfis Agora

Implementei um sistema **super simples** para você trocar de perfil sem fazer logout!

---

## 🔄 Opção 1: Botão "Trocar Perfil" (RECOMENDADO)

Agora todas as 4 páginas (Gerente, Cliente, Restaurante, Entregador) têm um botão azul no header:

```
┌─────────────────────────────────────────┐
│   🍕 FoodExpress                    👤 Admin │
│                                  [🔄 Trocar] │
│                                            │
│              Seu perfil: **Gerente**        │
│           Escolha outro para trocar       │
└─────────────────────────────────────────┘
```

**Como usar:**
1. Clique no botão azul **"🔄 Trocar"** em qualquer página
2. A página vai levar você de volta pra Seleção de Perfil
3. Escolha outro perfil (Cliente, Restaurante, Entregador, etc)
4. Clique em "Continuar"
5. **Pronto!** Você está testando o novo perfil sem fazer logout

---

## ✨ Páginas Atualizadas

| Página | Botão | Status |
|--------|-------|--------|
| 🔐 Gerente | ✅ Adicionado | Botão azul no header |
| 🏪 Restaurante | ✅ Adicionado | Botão azul no header |
| 🚴 Entregador | ✅ Adicionado | Botão azul no header |
| 👤 Cliente | ✅ Adicionado | Botão azul no header |

---

## 🚀 Fluxo de Teste Sugerido

### 1️⃣ Teste como GERENTE
```
Login com sua conta → /gerente
- Visualizar dashboard
- Testar funcionalidades
- Clicar [🔄 Trocar]
```

### 2️⃣ Teste como CLIENTE
```
Selecione "Cliente" → /cliente
- Ver catálogo de restaurantes
- Fazer um pedido
- Acompanhar entrega
- Clicar [🔄 Trocar]
```

### 3️⃣ Teste como RESTAURANTE
```
Selecione "Restaurante" → /restaurante
- Gerenciar cardápio
- Ver pedidos recebidos
- Atualizar status
- Clicar [🔄 Trocar]
```

### 4️⃣ Teste como ENTREGADOR
```
Selecione "Entregador" → /entregador
- Ver corridas disponíveis
- Aceitar pedidos
- Atualizar localização
- Clicar [🔄 Trocar]
```

---

## 📋 O que Muda em Cada Perfil?

### 🔐 GERENTE
```
URL: /gerente
Acesso: Dashboard gerencial, relatórios, aprovação de restaurantes
Ações: Visualizar todas estatísticas do sistema
```

### 👤 CLIENTE
```
URL: /cliente
Acesso: Catálogo de restaurantes, fazer pedidos, rastrear entrega
Ações: Buscar restaurantes, fazer pedido, avaliar, abrir ticket
```

### 🏪 RESTAURANTE
```
URL: /restaurante
Acesso: Gerenciar cardápio, receber pedidos
Ações: Criar items no cardápio, atualizar status dos pedidos
```

### 🚴 ENTREGADOR
```
URL: /entregador
Acesso: Listar corridas, aceitar entregas
Ações: Aceitar pedido, atualizar localização, confirmar entrega
```

---

## ⚙️ Mudança Técnica

Modifiquei 2 arquivos:

### 1. `/frontend/components/TrocarPerfilButton.tsx` ✨ NOVO
Um componente simples que mostra seu perfil atual e permite trocar:
```tsx
<div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
  <span className="text-sm font-medium text-blue-800">
    Perfil: <strong>{perfilAtual}</strong>
  </span>
  <Link href="/selecionar-role?trocar=true" className="px-3 py-1 bg-blue-600 ...">
    🔄 Trocar
  </Link>
</div>
```

### 2. `/frontend/app/selecionar-role/page.tsx` 🔧 MODIFICADO
Agora **permite voltar para a seleção de perfil** se o parâmetro `?trocar=true` estiver na URL:
```tsx
// Só redireciona automaticamente se NÃO for um "trocar perfil"
if (roleDefinido && !estaVolTandoDePerfil) {
  // redireciona...
}
```

### 3. Páginas de Role (4 arquivos) 🔧 MODIFICADAS
Importadas o componente em:
- `/frontend/app/gerente/page.tsx`
- `/frontend/app/cliente/page.tsx`
- `/frontend/app/restaurante/page.tsx`
- `/frontend/app/entregador/page.tsx`

---

## 🧬 Como Funciona Internamente

1. **Seu perfil é salvo em:** `user.unsafeMetadata.role` (Clerk)
2. **Ao clicar "Trocar":** Vai para `/selecionar-role?trocar=true`
3. **A página não te redireciona** porque detecta o parâmetro `trocar=true`
4. **Você escolhe novo perfil** e confirma
5. **O sistema atualiza** `unsafeMetadata` com o novo role
6. **Você é redirecionado** para a nova página

---

## 💡 Dicas para Testes Melhorados

### Dica 1: Use o Devtools do Navegador
```
F12 → Application → Cookies → clerk.*
Você pode ver seu role sendo atualizado em tempo real
```

### Dica 2: Teste em Múltiplas Abas
```
Aba 1: /gerente
Aba 2: /cliente
Aba 3: /restaurante
Aba 4: /entregador

Alterne entre elas sem fazer logout
```

### Dica 3: Teste as Transições de Status
```
Como CLIENTE: Crie um pedido
Como RESTAURANTE: Confirme o pedido
Como ENTREGADOR: Aceite a entrega
Como GERENTE: Visualize no dashboard
```

---

## ✅ Checklist de Teste Sugerido

- [ ] Login e aparecer em /selecionar-role
- [ ] Selecionar Gerente → Ir para /gerente ✅
- [ ] Clicar [🔄 Trocar] → Voltar para seleção ✅
- [ ] Selecionar Cliente → Ir para /cliente ✅
- [ ] Clicar [🔄 Trocar] → Voltar para seleção ✅
- [ ] Selecionar Restaurante → Ir para /restaurante ✅
- [ ] Clicar [🔄 Trocar] → Voltar para seleção ✅
- [ ] Selecionar Entregador → Ir para /entregador ✅
- [ ] Clicar [🔄 Trocar] → Voltar para seleção ✅
- [ ] Botão de Logout funciona em qualquer perfil ✅
- [ ] Dados do usuário permanecem salvos entre trocar perfil ✅

---

## 🎉 Bônus: Múltiplas Contas (Alternativa)

Se preferir criar **contas diferentes demais** para cada perfil:

1. **Abra uma janela anônima (Ctrl+Shift+N)**
2. **Faça sign-up com um email diferente**
3. **Selecione um perfil específico**
4. **Repita para cada perfil**

**Vantagem:** Testa o fluxo de onboarding completo
**Desvantagem:** Precisa gerenciar múltiplas contas

---

## 🚀 Próximos Passos (Dados de Teste)

Para registrar dados da, você pode criar:

### Para CLIENTE:
```bash
POST /api/clientes
```

### Para RESTAURANTE:
```bash
POST /api/restaurantes/cadastro
```

### Para ENTREGADOR:
```bash
POST /api/entregadores/cadastro
```

---

**Tudo pronto! Você pode testar todos os perfis agora! 🎊**
