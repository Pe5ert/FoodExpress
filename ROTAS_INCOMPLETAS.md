# 🔧 Rotas Incompletas e Faltando - FoodExpress

**Gerado em:** 4 de abril de 2026  
**Versão:** 2.0 Beta

---

## ⚙️ ROTAS QUE FALTAM IMPLEMENTAÇÃO COMPLETA

### 1. AVALIAÇõES - Implementação Incompleta ⚠️

**Status:** Sem rotas dinâmicas para edição/exclusão

#### ❌ Faltando:

```typescript
// GET - Buscar avaliação específica
GET /api/avaliacoes/[id]
// NÃO EXISTE

// PUT - Atualizar avaliação existente  
PUT /api/avaliacoes/[id]
// NÃO EXISTE

// DELETE - Remover avaliação
DELETE /api/avaliacoes/[id]
// NÃO EXISTE
```

#### ✅ Existe:
```typescript
GET /api/avaliacoes
POST /api/avaliacoes
```

#### Arquivo para Criar:
```
/frontend/app/api/avaliacoes/[id]/route.ts
```

---

### 2. CUPONS - Implementação Incompleta ⚠️

**Status:** Sem rotas para gerenciar cupons existentes

#### ❌ Faltando:

```typescript
// GET - Listar cupom específico
GET /api/cupons/[id]
// NÃO EXISTE

// PUT - Atualizar cupom
PUT /api/cupons/[id]
// NÃO EXISTE

// DELETE - Deletar cupom
DELETE /api/cupons/[id]
// NÃO EXISTE
```

#### ✅ Existe:
```typescript
GET /api/cupons (validação de cupom - hardcoded)
POST /api/cupons (criar cupom)
```

#### ⚠️ Problema:
- `GET /api/cupons` usa dados hardcoded, não lê do banco!

#### Arquivo para Criar:
```
/frontend/app/api/cupons/[id]/route.ts
```

---

### 3. TICKETS - Implementação Incompleta ⚠️

**Status:** Sem rotas para editar/deletar tickets

#### ❌ Faltando:

```typescript
// GET - Buscar ticket específico com histórico
GET /api/tickets/[id]
// NÃO EXISTE

// PUT - Atualizar status/adicionar resposta
PUT /api/tickets/[id]
// NÃO EXISTE

// DELETE - Fechar ticket
DELETE /api/tickets/[id]
// NÃO EXISTE
```

#### ✅ Existe:
```typescript
GET /api/tickets (listar tickets do cliente)
POST /api/tickets (criar novo ticket)
```

#### Arquivo para Criar:
```
/frontend/app/api/tickets/[id]/route.ts
```

---

### 4. CLIENTES - Implementação Incompleta ⚠️

**Status:** Sem DELETE para clientes

#### ❌ Faltando:

```typescript
// DELETE - Deletar cliente (soft delete)
DELETE /api/clientes/[id]
// NÃO EXISTE
```

#### ✅ Existe:
```typescript
GET /api/clientes
POST /api/clientes
GET /api/clientes/[id]
PUT /api/clientes/[id]
```

#### Arquivo a Atualizar:
```
/frontend/app/api/clientes/[id]/route.ts
(Adicionar método DELETE)
```

---

### 5. NOTIFICAÇõES - Não Implementado ❌

**Status:** Arquivo vazio - Nenhuma funcionalidade

#### ❌ Faltando Tudo:

```typescript
// Arquivo: /frontend/app/api/notificacoes/route.ts
// Status: VAZIO - Sem implementação
```

#### O que Implementar:

```typescript
// GET - Listar notificações do usuário
GET /api/notificacoes

// POST - Criar notificação (para testes)
POST /api/notificacoes

// PUT - Marcar como lida
PUT /api/notificacoes/[id]

// DELETE - Deletar notificação
DELETE /api/notificacoes/[id]

// WebSocket para tempo real (opcional mas recomendado)
WS /api/notificacoes/ws
```

---

## 🔐 ROTAS QUE FALTAM VALIDAÇÃO DE ROLE/PERMISSION

### Crítico: NENHUMA ROTA VALIDA ROLE! ⚠️⚠️⚠️

#### Rotas que DEVERIAM exigir `role: 'gerente'`:
```typescript
POST /api/restaurantes           // Criar restaurante
POST /api/cupons                 // Criar cupom
POST /api/restaurantes/[id]/aprovar  // Aprovar restaurante
GET /api/relatorios              // Gerar relatórios
```

#### Rotas que DEVERIAM exigir `role: 'restaurante'`:
```typescript
POST /api/cardapio               // Adicionar item ao cardápio
PUT /api/cardapio/[id]           // Editar item
DELETE /api/cardapio/[id]        // Remover item
```

#### Rotas que DEVERIAM exigir `role: 'entregador'`:
```typescript
PUT /api/entregadores/[id]       // Atualizar localização (próprio)
POST /api/entregadores/[id]/disponibilidade  // Marcar disponível
```

#### Rotas que DEVERIAM exigir `role: 'cliente'`:
```typescript
POST /api/pedidos                // Criar pedido
POST /api/avaliacoes             // Avaliar
POST /api/tickets                // Abrir ticket de suporte
DELETE /api/pedidos/[id]         // Cancelar pedido próprio
```

---

## 📋 SCRIPT DE CRIAÇÃO DAS ROTAS FALTANDO

### 1. Criar arquivo: `/frontend/app/api/avaliacoes/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET - Buscar avaliação por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const avaliacao = await db.execute({
      sql: 'SELECT * FROM avaliacoes WHERE id = ?',
      args: [params.id]
    })

    if (avaliacao.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(avaliacao.rows[0])
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar avaliação' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar avaliação
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { estrelas, comentario } = body

    // Validar
    if (!estrelas || estrelas < 1 || estrelas > 5) {
      return NextResponse.json(
        { erro: 'Estrelas deve estar entre 1 e 5' },
        { status: 400 }
      )
    }

    // Verificar ownership
    const avaliacao = await db.execute({
      sql: 'SELECT cliente_id FROM avaliacoes WHERE id = ?',
      args: [params.id]
    })

    if (avaliacao.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    if (avaliacao.rows[0].cliente_id !== userId) {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      )
    }

    await db.execute({
      sql: 'UPDATE avaliacoes SET estrelas = ?, comentario = ? WHERE id = ?',
      args: [estrelas, comentario || '', params.id]
    })

    return NextResponse.json({
      mensagem: 'Avaliação atualizada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error)
    return NextResponse.json(
      { erro: 'Erro ao atualizar avaliação' },
      { status: 500 }
    )
  }
}

// DELETE - Remover avaliação
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar ownership
    const avaliacao = await db.execute({
      sql: 'SELECT cliente_id FROM avaliacoes WHERE id = ?',
      args: [params.id]
    })

    if (avaliacao.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    if (avaliacao.rows[0].cliente_id !== userId) {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      )
    }

    await db.execute({
      sql: 'DELETE FROM avaliacoes WHERE id = ?',
      args: [params.id]
    })

    return NextResponse.json({
      mensagem: 'Avaliação removida com sucesso'
    })
  } catch (error) {
    console.error('Erro ao remover avaliação:', error)
    return NextResponse.json(
      { erro: 'Erro ao remover avaliação' },
      { status: 500 }
    )
  }
}
```

---

### 2. Criar arquivo: `/frontend/app/api/cupons/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET - Buscar cupom por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cupom = await db.execute({
      sql: 'SELECT * FROM cupons WHERE id = ?',
      args: [params.id]
    })

    if (cupom.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Cupom não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cupom.rows[0])
  } catch (error) {
    console.error('Erro ao buscar cupom:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar cupom' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cupom (apenas gerente)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    // TODO: Validar se user é gerente
    // if (user.role !== 'gerente') return 403

    const body = await request.json()
    const { desconto, minimo, data_expiracao, ativo } = body

    let sql = 'UPDATE cupons SET updated_at = CURRENT_TIMESTAMP'
    const args: any[] = []

    if (desconto !== undefined) {
      sql += ', desconto = ?'
      args.push(desconto)
    }
    if (minimo !== undefined) {
      sql += ', minimo = ?'
      args.push(minimo)
    }
    if (data_expiracao !== undefined) {
      sql += ', data_expiracao = ?'
      args.push(data_expiracao)
    }
    if (ativo !== undefined) {
      sql += ', ativo = ?'
      args.push(ativo ? 1 : 0)
    }

    sql += ' WHERE id = ?'
    args.push(params.id)

    await db.execute({ sql, args })

    return NextResponse.json({
      mensagem: 'Cupom atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error)
    return NextResponse.json(
      { erro: 'Erro ao atualizar cupom' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar cupom (apenas gerente)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    // TODO: Validar se user é gerente
    // if (user.role !== 'gerente') return 403

    await db.execute({
      sql: 'UPDATE cupons SET ativo = 0 WHERE id = ?',
      args: [params.id]
    })

    return NextResponse.json({
      mensagem: 'Cupom desativado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao remover cupom:', error)
    return NextResponse.json(
      { erro: 'Erro ao remover cupom' },
      { status: 500 }
    )
  }
}
```

---

### 3. Criar arquivo: `/frontend/app/api/tickets/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET - Buscar ticket por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    const ticket = await db.execute({
      sql: 'SELECT * FROM tickets WHERE id = ?',
      args: [params.id]
    })

    if (ticket.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Ticket não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se é proprietário ou gerente
    if (ticket.rows[0].cliente_id !== userId) {
      // TODO: Verificar se user.role === 'gerente'
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json(ticket.rows[0])
  } catch (error) {
    console.error('Erro ao buscar ticket:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar ticket' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar ticket (adicionar resposta/resolver)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, resposta } = body

    let sql = 'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP'
    const args: any[] = []

    if (status && ['aberto', 'em_analise', 'resolvido', 'fechado'].includes(status)) {
      sql += ', status = ?'
      args.push(status)
    }

    if (resposta) {
      sql += ', resposta = ?'
      args.push(resposta)
    }

    sql += ' WHERE id = ?'
    args.push(params.id)

    await db.execute({ sql, args })

    return NextResponse.json({
      mensagem: 'Ticket atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error)
    return NextResponse.json(
      { erro: 'Erro ao atualizar ticket' },
      { status: 500 }
    )
  }
}

// DELETE - Fechar ticket (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar ownership
    const ticket = await db.execute({
      sql: 'SELECT cliente_id FROM tickets WHERE id = ?',
      args: [params.id]
    })

    if (ticket.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Ticket não encontrado' },
        { status: 404 }
      )
    }

    if (ticket.rows[0].cliente_id !== userId) {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      )
    }

    await db.execute({
      sql: 'UPDATE tickets SET status = ? WHERE id = ?',
      args: ['fechado', params.id]
    })

    return NextResponse.json({
      mensagem: 'Ticket fechado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao fechar ticket:', error)
    return NextResponse.json(
      { erro: 'Erro ao fechar ticket' },
      { status: 500 }
    )
  }
}
```

---

### 4. Atualizar arquivo: `/frontend/app/api/clientes/[id]/route.ts`

Adicionar ao final:

```typescript
// DELETE - Deletar cliente (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar ownership
    const cliente = await db.execute({
      sql: 'SELECT user_id FROM clientes WHERE id = ?',
      args: [params.id]
    })

    if (cliente.rows.length === 0) {
      return NextResponse.json(
        { erro: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    if (cliente.rows[0].user_id !== userId) {
      return NextResponse.json(
        { erro: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Soft delete - marcar como inativo
    await db.execute({
      sql: 'UPDATE clientes SET status = ? WHERE id = ?',
      args: ['deletado', params.id]
    })

    return NextResponse.json({
      mensagem: 'Conta deletada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { erro: 'Erro ao deletar cliente' },
      { status: 500 }
    )
  }
}
```

---

## 📝 Tabelas Faltando no Schema

Adicionar a `/database/schema.sql`:

```sql
-- Tabela de avaliações
CREATE TABLE avaliacoes (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    pedido_id TEXT,
    restaurante_id TEXT,
    entregador_id TEXT,
    estrelas INTEGER NOT NULL CHECK(estrelas >= 1 AND estrelas <= 5),
    comentario TEXT,
    tipo TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-- Tabela de cupons (completar)
CREATE TABLE IF NOT EXISTS cupons (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    desconto REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('percentual', 'fixo')),
    minimo REAL DEFAULT 0,
    data_expiracao DATE,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tickets (completar)
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    pedido_id TEXT,
    status TEXT DEFAULT 'aberto' CHECK(status IN ('aberto', 'em_analise', 'resolvido', 'fechado')),
    prioridade TEXT DEFAULT 'normal' CHECK(prioridade IN ('baixa', 'normal', 'alta')),
    resposta TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Tabela de notificações
CREATE TABLE notificacoes (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    relacionado_id TEXT,
    tipo_relacionado TEXT,
    lida BOOLEAN DEFAULT 0,
    criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notificacoes_usuario (usuario_id),
    INDEX idx_notificacoes_lida (lida)
);

-- Adicionar coluna status a clientes (para soft delete)
ALTER TABLE clientes ADD COLUMN status TEXT DEFAULT 'ativo';
```

---

## 🎯 Prioridade de Implementação

1. **Hoje (Crítico):**
   - Criar `/api/avaliacoes/[id]/route.ts`
   - Adicionar DELETE a `/api/clientes/[id]/route.ts`
   - Criar `/api/cupons/[id]/route.ts`
   - Adicionar tabelas ao schema.sql

2. **Esta semana:**
   - Criar `/api/tickets/[id]/route.ts`
   - Implementar validações de role em POST/PUT/DELETE
   - Fixar cupons hardcoded

3. **Este mês:**
   - Completar notificações
   - Adicionar WebSocket para rastreamento
   - Testes de segurança completos

---

**Documento gerado automaticamente**  
**Última atualização:** 4 de abril de 2026
