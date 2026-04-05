# 📊 Análise CRUD - Perfis e Métodos - FoodExpress

**Data:** 4 de abril de 2026  
**Versão:** 2.0  
**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

---

## 📋 Resumo Executivo

O projeto FoodExpress implementa um sistema de delivery com 4 perfis principais: **Gerente**, **Restaurante**, **Entregador** e **Cliente**. 

**Status Geral:**
- ✅ **57% Implementado** - Muitas rotas CRUD existem
- ⚠️ **Faltam validações críticas de permissão** - Qualquer usuário pode acessar qualquer recurso
- ❌ **Recursos incompletos** - Avaliações, Cupons e Tickets faltam operações UPDATE/DELETE

---

## 👥 Perfis Identificados

| Perfil | ID Banco | Tabela | Status |
|--------|----------|--------|--------|
| 🔐 Gerente/Operador | `operadores` | operadores | ✅ Existe |
| 🏪 Restaurante | `gerentes` | gerentes | ✅ Existe |
| 🚴 Entregador | `entregadores` | entregadores | ✅ Existe |
| 👤 Cliente | `clientes` | clientes | ✅ Existe |

---

## 📦 Análise CRUD por Recurso

### 1️⃣ RESTAURANTES

**Banco de Dados:** `restaurantes` table  
**API Base:** `/api/restaurantes`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/restaurantes` | ✅ | Sem validação de role (qualquer usuário pode criar) |
| **READ** | `GET /api/restaurantes` | ✅ | Sem autenticação necessária, expõe dados públicos |
| **READ** | `GET /api/restaurantes/[id]` | ✅ | Sem autenticação necessária |
| **UPDATE** | `PUT /api/restaurantes/[id]` | ✅ | ⚠️ Sem verificação se usuário é proprietário |
| **DELETE** | `DELETE /api/restaurantes/[id]` | ✅ | ⚠️ Soft delete (marca como 'inativo') |
| **APROVAR** | `POST /api/restaurantes/[id]/aprovar` | ✅ | Requires verificação de role Gerente |

**Validações Faltando:**
```typescript
// ❌ NÃO EXISTE - Deveria verificar:
if (user.role !== 'gerente') return 401
if (restaurante.user_id !== userId) return 403  // Para PUT/DELETE
```

**Dados Sensíveis Expostos:** EMAIL, TELEFONE, LOCALIZAÇÃO

---

### 2️⃣ CARDÁPIO

**Banco de Dados:** `cardapio` table  
**API Base:** `/api/cardapio`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/cardapio` | ✅ | ⚠️ Qualquer usuário pode adicionar itens |
| **READ** | `GET /api/cardapio` | ✅ | ✅ Sem autenticação necessária (público) |
| **READ** | `GET /api/cardapio/[id]` | ✅ | ✅ Sem autenticação necessária |
| **UPDATE** | `PUT /api/cardapio/[id]` | ✅ | ⚠️ Sem verificação de proprietário |
| **DELETE** | `DELETE /api/cardapio/[id]` | ✅ | Soft delete (marca como 'indisponível') |

**Validações Faltando:**
```typescript
// ❌ POST deveria verificar se user.role === 'restaurante'
// ❌ PUT/DELETE deveria verificar se cardapio.restaurante_id == user.restaurante_id
```

---

### 3️⃣ PEDIDOS

**Banco de Dados:** `pedidos` table  
**API Base:** `/api/pedidos`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/pedidos` | ✅ | ⚠️ Qualquer usuário autenticado pode criar |
| **READ** | `GET /api/pedidos` | ✅ | ⚠️ Sem filtro de cliente_id (vê todos pedidos) |
| **READ** | `GET /api/pedidos/[id]` | ✅ | Sem verificação se é cliente/entregador/restaurante |
| **UPDATE** | `PUT /api/pedidos/[id]` | ✅ | ⚠️ Sem validação de transição de status |
| **DELETE** | `DELETE /api/pedidos/[id]` | ✅ | Implementa regra RN006 (multa cancelamento) |
| **RASTREAR** | `GET /api/pedidos/[id]/rastrear` | ✅ | Sem autenticação |
| **ATRIBUIR** | `POST /api/pedidos/[id]/atribuir-entregador` | ✅ | Requer verificação de role |
| **AUTO-ATRIBUIR** | `POST /api/pedidos/[id]/atribuir-entregador-automatico` | ✅ | ✅ Implementado |

**Validações Faltando:**
```typescript
// ❌ GET deveria filtrar por user.role:
// - Cliente: vê apenas seus pedidos
// - Restaurante: vê pedidos do seu restaurante
// - Entregador: vê pedidos atribuídos a ele
// - Gerente: vê todos

// ❌ Status transitions não validadas:
// pendente → preparando → pronto → em_entrega → entregue ✅
// Mas qualquer um pode pular etapas
```

---

### 4️⃣ ENTREGADORES

**Banco de Dados:** `entregadores` table  
**API Base:** `/api/entregadores`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/entregadores` | ✅ | ⚠️ Qualquer usuário pode criar |
| **CREATE** | `POST /api/entregadores/cadastro` | ✅ | Criado ao selecionar role |
| **READ** | `GET /api/entregadores` | ✅ | ✅ Sem autenticação (público?) |
| **READ** | `GET /api/entregadores/[id]` | ✅ | Sem autenticação |
| **UPDATE** | `PUT /api/entregadores/[id]` | ✅ | ⚠️ Sem verificação de proprietário |
| **DELETE** | `DELETE /api/entregadores/[id]` | ✅ | Soft delete (marca como 'inativo') |
| **DISPONIBILIDADE** | `GET /api/entregadores/[id]/disponibilidade` | ✅ | Sem autenticação |
| **DISPONIBILIDADE** | `POST /api/entregadores/[id]/disponibilidade` | ✅ | Implementado |

**Validações Faltando:**
```typescript
// ❌ PUT/DELETE deveria verificar se user.id === entregador.user_id
// ⚠️ GET listar todos - deveria ter autenticação?
```

---

### 5️⃣ CLIENTES

**Banco de Dados:** `clientes` table  
**API Base:** `/api/clientes`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/clientes` | ✅ | Criado ao selecionar role |
| **READ** | `GET /api/clientes` | ✅ | ⚠️ Retorna apenas cliente logado |
| **READ** | `GET /api/clientes/[id]` | ✅ | Sem verificação se é o próprio usuário |
| **UPDATE** | `PUT /api/clientes/[id]` | ✅ | ⚠️ Sem verificação de proprietário |
| **DELETE** | `DELETE /api/clientes/[id]` | ❌ | **NÃO IMPLEMENTADO** |

**Problemas Críticos:**
```typescript
// ❌ DELETAR cliente - FALTANDO IMPLEMENTAÇÃO
// ❌ PUT deveria verificar se user.id === params.id
// ❌ GET [id] deveria verificar se user.id === params.id
```

---

### 6️⃣ AVALIAÇÕES

**Banco de Dados:** `avaliacoes` table (Não definida em schema.sql!)  
**API Base:** `/api/avaliacoes`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/avaliacoes` | ✅ | ⚠️ Sem validação se cliente já avaliou |
| **READ** | `GET /api/avaliacoes` | ✅ | ✅ Filtra por restaurante/entregador |
| **READ** | `GET /api/avaliacoes/[id]` | ❌ | **NÃO IMPLEMENTADO** |
| **UPDATE** | `PUT /api/avaliacoes/[id]` | ❌ | **NÃO IMPLEMENTADO** |
| **DELETE** | `DELETE /api/avaliacoes/[id]` | ❌ | **NÃO IMPLEMENTADO** |

**Problemas Críticos:**
```typescript
❌ Tabela não definida em schema.sql
❌ Rota dinâmica [id] completamente ausente
❌ Sem forma de editar/deletar avaliação
❌ Estrutura da tabela desconhecida
```

**SQL esperado (MISSING):**
```sql
CREATE TABLE avaliacoes (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    pedido_id TEXT,
    restaurante_id TEXT,
    entregador_id TEXT,
    estrelas INTEGER (1-5),
    comentario TEXT,
    tipo TEXT ('restaurante' | 'entregador'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);
```

---

### 7️⃣ CUPONS

**Banco de Dados:** `cupons` table (Não definida em schema.sql!)  
**API Base:** `/api/cupons`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/cupons` | ✅ | ⚠️ Sem validação de role (admin only?) |
| **READ** | `GET /api/cupons` | ✅ | Validação de cupom (hardcoded) |
| **READ** | `GET /api/cupons/[id]` | ❌ | **NÃO IMPLEMENTADO** |
| **UPDATE** | `PUT /api/cupons/[id]` | ❌ | **NÃO IMPLEMENTADO** |
| **DELETE** | `DELETE /api/cupons/[id]` | ❌ | **NÃO IMPLEMENTADO** |

**Problemas Críticos:**
```typescript
❌ Tabela não definida em schema.sql
❌ GET usa dados hardcoded, não lê do banco
❌ Rota dinâmica [id] completamente ausente
❌ Sem forma de atualizar/deletar cupom
```

**SQL esperado (MISSING):**
```sql
CREATE TABLE cupons (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    desconto REAL NOT NULL,
    tipo TEXT ('percentual' | 'fixo'),
    minimo REAL DEFAULT 0,
    data_expiracao DATE,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 8️⃣ TICKETS (Suporte)

**Banco de Dados:** `tickets` table (Não definida em schema.sql!)  
**API Base:** `/api/tickets`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/tickets` | ✅ | Validação básica presente |
| **READ** | `GET /api/tickets` | ✅ | Filtra por cliente_id logado |
| **READ** | `GET /api/tickets/[id]` | ❌ | **NÃO IMPLEMENTADO** |
| **UPDATE** | `PUT /api/tickets/[id]` | ❌ | **NÃO IMPLEMENTADO** |
| **DELETE** | `DELETE /api/tickets/[id]` | ❌ | **NÃO IMPLEMENTADO** |

**Problemas Críticos:**
```typescript
❌ Tabela não definida em schema.sql
❌ Rota dinâmica [id] completamente ausente
❌ Sem forma de atualizar/resolver ticket
❌ Sem forma de deletar ticket
```

**SQL esperado (MISSING):**
```sql
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    pedido_id TEXT,
    status TEXT ('aberto' | 'em_analise' | 'resolvido' | 'fechado'),
    prioridade TEXT ('baixa' | 'normal' | 'alta'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

---

### 9️⃣ DISPUTAS

**Banco de Dados:** `disputas` table  
**API Base:** `/api/disputas`

| Método | Rota | Status | Problemas |
|--------|------|--------|-----------|
| **CREATE** | `POST /api/disputas` | ✅ | ✅ Validações presentes |
| **READ** | `GET /api/disputas` | ✅ | ✅ Filtra por criador_id |
| **READ** | `GET /api/disputas/[id]` | ✅ | Requer autenticação |
| **UPDATE** | `PUT /api/disputas/[id]` | ✅ | ✅ Atualiza status e resolução |
| **DELETE** | `DELETE /api/disputas/[id]` | ✅ | Soft delete (marca como cancelada) |

**Status:** ✅ COMPLETO

---

### 🔟 NOTIFICAÇÕES

**Banco de Dados:** ❌ Não existe  
**API Base:** `/api/notificacoes`

| Método | Rota | Status |
|--------|------|--------|
| **CREATE** | `POST /api/notificacoes` | ❌ |
| **READ** | `GET /api/notificacoes` | ❌ |
| **ALL** | **ARQUIVO VAZIO** | ❌ |

**Status:** ❌ NÃO IMPLEMENTADO

---

## 🔐 Matriz de Permissões por Perfil

### ⚠️ CRÍTICO: Faltam Validações em TODAS as rotas!

Nenhuma rota verifica `user.role` ou `user_metadata` do Clerk para controlar permissões.

**Roles esperados (baseado em schema):**
- `gerente` - Operador/Gerente da plataforma
- `restaurante` - Proprietário de restaurante
- `entregador` - Entregador/Motorista
- `cliente` - Cliente final

### Matriz Esperada:

| Recurso | Gerente | Restaurante | Entregador | Cliente |
|---------|---------|-------------|-----------|---------|
| **Restaurantes** | ✅ CRUD | ❌ Read/Edit próprio | ❌ | ❌ |
| **Cardápio** | ✅ Read | ✅ CRUD próprio rest. | ❌ | ✅ Read |
| **Pedidos** | ✅ CRUD | ✅ Read/Update próprios | ✅ Accept/Update | ✅ CRUD próprios |
| **Entregadores** | ✅ CRUD | ❌ | ✅ Read/Edit próprio | ❌ |
| **Clientes** | ✅ Read | ❌ | ❌ | ✅ Read/Edit próprio |
| **Avaliações** | ✅ Read | ❌ | ❌ | ✅ Create/Delete próprias |
| **Cupons** | ✅ CRUD | ❌ | ❌ | ❌ Read |
| **Tickets** | ✅ CRUD | ❌ | ❌ | ✅ CRUD próprios |
| **Disputas** | ✅ CRUD | ✅ Respond | ✅ Respond | ✅ Create/Respond |
| **Relatórios** | ✅ CRUD | ✅ Próprios | ✅ Próprios | ❌ |

**Status Atual:** ❌ NENHUMA VALIDAÇÃO IMPLEMENTADA

---

## 📝 Problemas Identificados

### 🔴 Críticos

1. **Falta de Autenticação em Rotas Públicas**
   ```
   ❌ GET /api/restaurantes - Sem autenticação
   ❌ GET /api/restaurantes/[id] - Sem autenticação
   ❌ GET /api/entregadores - Sem autenticação
   ❌ GET /api/pedidos/[id]/rastrear - Sem autenticação
   ```

2. **Falta de Validação de Role em Todas as Rotas**
   ```
   ❌ POST /api/restaurantes - Qualquer usuário pode criar
   ❌ POST /api/cardapio - Qualquer usuário pode criar itens
   ❌ POST /api/cupons - Admin não verificado
   ❌ PUT/DELETE - Sem verificação de proprietário
   ```

3. **Recursos Incompletos (Faltam Rotas Dinâmicas)**
   ```
   ❌ Avaliações: Sem GET/PUT/DELETE [id]
   ❌ Cupons: Sem GET/PUT/DELETE [id]
   ❌ Tickets: Sem GET/PUT/DELETE [id]
   ❌ Notificações: Arquivo vazio
   ```

4. **Tabelas Faltando no Schema**
   ```
   ❌ avaliacoes - Estrutura desconhecida
   ❌ cupons - Definição parcial
   ❌ tickets - Definição parcial
   ❌ notificacoes - Não existe
   ```

5. **Falta de Verificação de Autorização**
   ```
   ❌ restaurante.user_id !== userId → 403 (não verificado)
   ❌ cliente_id !== userId → 403 (não verificado)
   ❌ entregador.user_id !== userId → 403 (não verificado)
   ```

### 🟡 Moderados

1. **Status de Pedidos sem Validação**
   - Qualquer um pode pular etapas de processamento
   - Sem webhook para notificar outras partes

2. **Cupons Hardcoded**
   - GET /api/cupons usa dados hardcoded
   - Não lê da base de dados

3. **Tickets e Avaliações Sem Édição**
   - Usuário não pode corrigir avaliação errada
   - Suporte não pode responder ticket

4. **Soft Deletes Inconsistentes**
   - Restaurantes: marca como 'inativo'
   - Cardápio: marca como 'indisponível'
   - Entregadores: marca como 'inativo'
   - Pedidos: marca como 'cancelado'
   - (Sem padrão único)

---

## ✅ Recomendações de Correção

### Prioridade 1 (URGENTE) - Segurança

1. **Adicionar validação de role em POST/PUT/DELETE**
   ```typescript
   export async function POST(request: Request) {
     const user = await currentUser()
     const role = user?.publicMetadata?.role
     
     if (role !== 'gerente') {
       return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
     }
     // ... resto do código
   }
   ```

2. **Validar propriedade de recursos**
   ```typescript
   // Para PUT/DELETE de restaurante
   if (restaurante.user_id !== userId && role !== 'gerente') {
     return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
   }
   ```

3. **Filtrar listagens por role**
   ```typescript
   // GET /api/pedidos
   if (role === 'cliente') {
     sql += ' WHERE cliente_id = ?'
   } else if (role === 'restaurante') {
     sql += ' WHERE restaurante_id = ?'
   } else if (role === 'entregador') {
     sql += ' WHERE entregador_id = ?'
   }
   ```

### Prioridade 2 (IMPORTANTE) - Completar CRUD

1. **Criar rotas dinâmicas para avaliações, cupons e tickets**
   ```
   PUT /api/avaliacoes/[id]
   DELETE /api/avaliacoes/[id]
   
   GET /api/cupons/[id]
   PUT /api/cupons/[id]
   DELETE /api/cupons/[id]
   
   GET /api/tickets/[id]
   PUT /api/tickets/[id]
   DELETE /api/tickets/[id]
   ```

2. **Adicionar DELETE para clientes**
   ```
   DELETE /api/clientes/[id]
   ```

3. **Criar tabelas faltando em schema.sql**
   - Estruturar `avaliacoes` corretamente
   - Estruturar `cupons` corretamente
   - Estruturar `tickets` corretamente
   - Criar `notificacoes`

### Prioridade 3 (MELHORIAS) - Funcionalidade

1. **Implementar notificações**
   - WebSocket para rastreamento em tempo real
   - Notificações de status de pedido

2. **Fixar cupons hardcoded**
   - Ler dados do banco em GET /api/cupons
   - Validar com JOIN na tabela

3. **Adicionar validação de transições de status**
   - Garantir que pedidos siga fluxo: pendente → preparando → pronto → entrega → entregue

4. **Implementar soft delete consistente**
   - Usar coluna `deleted_at` ou `status = 'deletado'` para todos

---

## 🧪 Checklist de Testes Recomendado

- [ ] Testar acesso sem autenticação em todas as rotas
- [ ] Testar POST com usuário sem role apropriado
- [ ] Testar PUT/DELETE de recurso de outro usuário
- [ ] Testar lista de pedidos como cliente (deve Ver só seus)
- [ ] Testar lista de pedidos como restaurante (deve ver só dele)
- [ ] Testar lista de pedidos como entregador (deve ver atribuídos)
- [ ] Testar criar avaliação, depois editá-la
- [ ] Testar criar cupom sem permissão
- [ ] Testar criar ticket, depois atualizá-lo
- [ ] Testar deletar perfil de cliente

---

## 📊 Resumo Estatístico

| Métrica | Valor | Status |
|---------|-------|--------|
| **Total de Recursos** | 10 | |
| **Recursos com CRUD Completo** | 5 | 50% |
| **Recursos com CRUD Parcial** | 4 | 40% |
| **Recursos sem Implementação** | 1 | 10% |
| **Rotas com Role Check** | 0 | 0% ⚠️ CRÍTICO |
| **Rotas com Ownership Validation** | 0 | 0% ⚠️ CRÍTICO |
| **Total de Endpoints** | 45+ | |
| **Endpoints Inseguros** | 35+ | 78% ⚠️ |

---

## 📎 Anexos

### Arquivo de Referência
Este relatório analisou:
- `/database/schema.sql` - Estrutura do banco
- `/frontend/app/api/**/route.ts` - Todas as rotas (27 arquivos)
- `/middleware.ts` - Configuração de autenticação
- `/ROTAS_API.md` - Documentação de rotas

### Próximas Ações
1. Implementar validações de role em todas as rotas
2. Completar rotas dinâmicas faltando
3. Corrigir tabelas do banco de dados
4. Funcionalizar notificações
5. Executar test de segurança

---

**Gerado por:** Análise Automática  
**Data:** 4 de abril de 2026  
**Confiabilidade:** Alta (análise estática de código)
