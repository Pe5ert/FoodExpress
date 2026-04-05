# 🎯 Checklist CRUD por Perfil - FoodExpress

**Data:** 4 de abril de 2026  
**Versão:** 2.0

---

## 📊 Status Visual Rápido

| Recurso | CREATE | READ | UPDATE | DELETE | % Completo |
|---------|--------|------|--------|--------|-----------|
| 🏪 Restaurantes | ✅ | ✅ | ✅ | ✅ | 100% |
| 🍔 Cardápio | ✅ | ✅ | ✅ | ✅ | 100% |
| 📦 Pedidos | ✅ | ✅ | ✅ | ✅ | 100% |
| 🚴 Entregadores | ✅ | ✅ | ✅ | ✅ | 100% |
| 👤 Clientes | ✅ | ✅ | ✅ | ❌ | 75% |
| ⭐ Avaliações | ✅ | ✅ | ❌ | ❌ | 50% |
| 🎟️ Cupons | ✅ | ✅ | ❌ | ❌ | 50% |
| 🎫 Tickets | ✅ | ✅ | ❌ | ❌ | 50% |
| 💬 Disputas | ✅ | ✅ | ✅ | ✅ | 100% |
| 📣 Notificações | ❌ | ❌ | ❌ | ❌ | 0% |

---

## 👥 Checklist por Perfil

### 🔐 PERFIL: GERENTE / OPERADOR

#### Restaurantes
- [x] **CREATE** - `POST /api/restaurantes` ✅
- [x] **READ** - `GET /api/restaurantes` ✅
- [x] **READ** - `GET /api/restaurantes/[id]` ✅
- [x] **UPDATE** - `PUT /api/restaurantes/[id]` ✅
- [x] **DELETE** - `DELETE /api/restaurantes/[id]` ✅
- [x] **APROVAR** - `POST /api/restaurantes/[id]/aprovar` ✅
- [ ] **Validar Role** - ❌ FALTANDO

#### Cardápio
- [ ] **READ** - `GET /api/cardapio` ✅
- [ ] **Validar acesso** - ❌ FALTANDO

#### Pedidos
- [x] **READ** - `GET /api/pedidos` ✅
- [x] **READ** - `GET /api/pedidos/[id]` ✅
- [ ] **Filtrar por role** - ❌ FALTANDO

#### Entregadores
- [x] **CREATE** - `POST /api/entregadores` ✅
- [x] **READ** - `GET /api/entregadores` ✅
- [x] **READ** - `GET /api/entregadores/[id]` ✅
- [x] **UPDATE** - `PUT /api/entregadores/[id]` ✅
- [x] **DELETE** - `DELETE /api/entregadores/[id]` ✅
- [ ] **Validar Role** - ❌ FALTANDO

#### Cupons
- [x] **CREATE** - `POST /api/cupons` ✅
- [x] **READ** - `GET /api/cupons` (hardcoded) ⚠️
- [ ] **READ** - `GET /api/cupons/[id]` ❌ FALTANDO
- [ ] **UPDATE** - `PUT /api/cupons/[id]` ❌ FALTANDO
- [ ] **DELETE** - `DELETE /api/cupons/[id]` ❌ FALTANDO
- [ ] **Validar Role** - ❌ FALTANDO

#### Relatórios
- [x] **READ** - `GET /api/relatorios?tipo=vendas` ✅
- [x] **READ** - 12 tipos de relatórios ✅
- [ ] **Validar Role** - ❌ FALTANDO

#### Disputas
- [x] **READ** - `GET /api/disputas` ✅
- [x] **READ** - `GET /api/disputas/[id]` ✅
- [x] **UPDATE** - `PUT /api/disputas/[id]` ✅
- [ ] **Validar Role** - ❌ FALTANDO

#### Notificações
- [ ] **CREATE** - ❌ NÃO IMPLEMENTADO
- [ ] **READ** - ❌ NÃO IMPLEMENTADO
- [ ] **UPDATE** - ❌ NÃO IMPLEMENTADO
- [ ] **DELETE** - ❌ NÃO IMPLEMENTADO

**Resumo:** 25/35 endpoints (71%) ⚠️ FALTAM VALIDAÇÕES DE ROLE

---

### 🏪 PERFIL: RESTAURANTE

#### Restaurantes (Próprio)
- [ ] **READ** - `GET /api/restaurantes/[id]` ✅ (mas sem validação)
- [ ] **UPDATE** - `PUT /api/restaurantes/[id]` ✅ (sem verificar ownership)
- [ ] **Validar ownership** - ❌ FALTANDO

#### Cardápio
- [x] **CREATE** - `POST /api/cardapio` ✅
- [x] **READ** - `GET /api/cardapio?restauranteId=X` ✅
- [x] **READ** - `GET /api/cardapio/[id]` ✅
- [x] **UPDATE** - `PUT /api/cardapio/[id]` ✅
- [x] **DELETE** - `DELETE /api/cardapio/[id]` ✅
- [ ] **Validar ownership** - ❌ FALTANDO

#### Pedidos
- [x] **READ** - `GET /api/pedidos?restauranteId=X` ✅
- [x] **UPDATE** - `PUT /api/pedidos/[id]` (status) ✅
- [ ] **Filtrar pedidos próprios** - ❌ FALTANDO
- [ ] **Validar ownership** - ❌ FALTANDO

#### Avaliações
- [x] **READ** - `GET /api/avaliacoes?restauranteId=X` ✅
- [ ] **Responder avaliação** - ❌ FALTANDO

#### Disputas
- [ ] **READ** - `GET /api/disputas` ⚠️ (sem filtro)
- [ ] **UPDATE** - `PUT /api/disputas/[id]` (responder) ✅ (sem validação)
- [ ] **Validar role** - ❌ FALTANDO

#### Relatórios (Próprio)
- [ ] **READ** - `GET /api/relatorios` ⚠️ (sem filtro por restaurante)
- [ ] **Validar acesso** - ❌ FALTANDO

#### Notificações
- [ ] **READ** - ❌ NÃO IMPLEMENTADO

**Resumo:** 11/20 endpoints (55%) ⚠️ FALTAM VALIDAÇÕES E FILTROS

---

### 🚴 PERFIL: ENTREGADOR

#### Entregadores (Próprio)
- [x] **READ** - `GET /api/entregadores/[id]` ✅ (sem validação)
- [x] **UPDATE** - `PUT /api/entregadores/[id]` ✅ (sem verificar ownership)
- [x] **Localização** - `PUT /api/entregadores/[id]` (latitude/longitude) ✅
- [ ] **Validar ownership** - ❌ FALTANDO

#### Disponibilidade
- [x] **READ** - `GET /api/entregadores/[id]/disponibilidade` ✅
- [x] **UPDATE** - `POST /api/entregadores/[id]/disponibilidade` ✅
- [ ] **Validar ownership** - ❌ FALTANDO

#### Pedidos
- [x] **READ** - `GET /api/pedidos?entregadorId=X` ✅
- [x] **UPDATE** - `PUT /api/pedidos/[id]` (aceitar/atualizar status) ✅
- [x] **RASTREAR** - `GET /api/pedidos/[id]/rastrear` ✅
- [ ] **Filtrar pedidos atribuídos** - ❌ FALTANDO
- [ ] **Validar ownership** - ❌ FALTANDO

#### Avaliações
- [ ] **READ** - `GET /api/avaliacoes?entregadorId=X` ✅
- [ ] **Responder avaliação** - ❌ FALTANDO

#### Rotas
- [x] **CALCULAR** - `GET /api/rotas/calcular` ✅
- [ ] **Validar role** - ❌ FALTANDO

#### Notificações
- [ ] **READ** - ❌ NÃO IMPLEMENTADO

**Resumo:** 9/15 endpoints (60%) ⚠️ FALTAM VALIDAÇÕES

---

### 👤 PERFIL: CLIENTE

#### Clientes (Próprio)
- [x] **CREATE** - `POST /api/clientes` ✅
- [x] **READ** - `GET /api/clientes` ✅ (retorna próprio)
- [x] **READ** - `GET /api/clientes/[id]` ✅ (sem validação)
- [x] **UPDATE** - `PUT /api/clientes/[id]` ✅ (sem verificar ownership)
- [ ] **DELETE** - `DELETE /api/clientes/[id]` ❌ FALTANDO
- [ ] **Validar ownership** - ❌ FALTANDO

#### Pedidos
- [x] **CREATE** - `POST /api/pedidos` ✅
- [x] **READ** - `GET /api/pedidos?clienteId=X` ✅
- [x] **READ** - `GET /api/pedidos/[id]` ✅ (sem validação)
- [x] **UPDATE** - `PUT /api/pedidos/[id]` (cancelar) ✅
- [x] **DELETE** - `DELETE /api/pedidos/[id]` ✅ (com multa RN006)
- [x] **RASTREAR** - `GET /api/pedidos/[id]/rastrear` ✅
- [ ] **Filtrar próprios pedidos** - ❌ FALTANDO
- [ ] **Validar ownership** - ❌ FALTANDO

#### Avaliações
- [x] **CREATE** - `POST /api/avaliacoes` ✅
- [x] **READ** - `GET /api/avaliacoes` ✅
- [ ] **READ** - `GET /api/avaliacoes/[id]` ❌ FALTANDO
- [ ] **UPDATE** - `PUT /api/avaliacoes/[id]` ❌ FALTANDO
- [ ] **DELETE** - `DELETE /api/avaliacoes/[id]` ❌ FALTANDO
- [ ] **Validar ownership** - ❌ FALTANDO

#### Cupons
- [x] **READ** - `GET /api/cupons?codigo=X` ✅ (validação)
- [ ] **Acesso completo** - ❌ (apenas validação)

#### Tickets
- [x] **CREATE** - `POST /api/tickets` ✅
- [x] **READ** - `GET /api/tickets` ✅ (filtro cliente_id)
- [ ] **READ** - `GET /api/tickets/[id]` ❌ FALTANDO
- [ ] **UPDATE** - `PUT /api/tickets/[id]` ❌ FALTANDO
- [ ] **DELETE** - `DELETE /api/tickets/[id]` ❌ FALTANDO
- [ ] **Validar ownership** - ❌ FALTANDO

#### Disputas
- [x] **CREATE** - `POST /api/disputas` ✅
- [x] **READ** - `GET /api/disputas` ✅ (filtro criador_id)
- [x] **UPDATE** - `PUT /api/disputas/[id]` (responder) ✅
- [ ] **Validar ownership** - ❌ FALTANDO

#### Documentos
- [ ] **UPLOAD** - `POST /api/documentos/upload` (não verificado)
- [ ] **Validar role** - ❌ FALTANDO

#### Notificações
- [ ] **READ** - ❌ NÃO IMPLEMENTADO

**Resumo:** 17/30 endpoints (57%) ⚠️ FALTAM ROTAS DINÂMICAS E VALIDAÇÕES

---

## ❌ Tabela de Problemas Críticos

| Problema | Severidade | Afetados | Status |
|----------|-----------|----------|--------|
| Sem validação de ROLE em nenhuma rota | 🔴 CRÍTICO | 45+ rotas | ❌ |
| Sem verificação de OWNERSHIP (user_id) | 🔴 CRÍTICO | 25+ rotas | ❌ |
| GET sem autenticação (público demais) | 🔴 CRÍTICO | 10+ rotas | ❌ |
| Avaliações faltam [id] | 🟡 IMPORTANTE | 5 rotas | ❌ |
| Cupons hardcoded | 🟡 IMPORTANTE | 2 rotas | ⚠️ |
| Tickets faltam [id] | 🟡 IMPORTANTE | 5 rotas | ❌ |
| Clientes faltam DELETE | 🟡 IMPORTANTE | 1 rota | ❌ |
| Notificações vazio | 🟡 IMPORTANTE | 4 rotas | ❌ |
| Tabelas não em schema | 🟠 MODERADO | 4 tabelas | ❌ |

---

## 🛠️ Checklist de Correção

### Fase 1: Segurança (Semana 1)

- [ ] Adicionar `currentUser()` e verificar `publicMetadata.role` em:
  - [ ] `POST /api/restaurantes`
  - [ ] `POST /api/cardapio`
  - [ ] `POST /api/cupons`
  - [ ] `POST /api/entregadores`
  - [ ] `POST /api/restaurantes/[id]/aprovar`
  
- [ ] Adicionar validação de propriedade em:
  - [ ] `PUT /api/restaurantes/[id]`
  - [ ] `DELETE /api/restaurantes/[id]`
  - [ ] `PUT /api/cardapio/[id]`
  - [ ] `DELETE /api/cardapio/[id]`
  - [ ] `PUT /api/entregadores/[id]`
  - [ ] `DELETE /api/entregadores/[id]`
  - [ ] `PUT /api/clientes/[id]`
  - [ ] `DELETE /api/clientes/[id]` (quando criar)

- [ ] Filtrar listagens por role:
  - [ ] `GET /api/pedidos` - filtrar cliente_id/restaurante_id/entregador_id
  - [ ] `GET /api/cardapio` - opcionalmente só do restaurante
  - [ ] `GET /api/avaliacoes` - filtrar por ownership

### Fase 2: Rotas Faltando (Semana 2)

- [ ] Criar `/api/avaliacoes/[id]/route.ts` (GET/PUT/DELETE)
- [ ] Criar `/api/cupons/[id]/route.ts` (GET/PUT/DELETE)
- [ ] Criar `/api/tickets/[id]/route.ts` (GET/PUT/DELETE)
- [ ] Adicionar DELETE a `/api/clientes/[id]`
- [ ] Implementar `/api/notificacoes/route.ts` (GET/POST)

### Fase 3: Banco de Dados (Semana 2)

- [ ] Adicionar tabelas ao schema.sql:
  - [ ] `avaliacoes` (completa)
  - [ ] `cupons` (completa)
  - [ ] `tickets` (completa)
  - [ ] `notificacoes` (nova)
  
- [ ] Adicionar coluna `status` a `clientes`
- [ ] Adicionar índices:
  - [ ] avaliacoes(cliente_id, restaurante_id, entregador_id)
  - [ ] cupons(codigo)
  - [ ] tickets(cliente_id, status)
  - [ ] notificacoes(usuario_id, lida)

### Fase 4: Testes (Semana 3)

- [ ] Testar acesso sem autenticação (deve dar 401)
- [ ] Testar com role errado (deve dar 403)
- [ ] Testar editar recurso de outro usuário (deve dar 403)
- [ ] Testar visibilidade de dados por role
- [ ] Testar CRUD completo para cada recurso
- [ ] Teste de carga/performance

---

## 📞 Contato e Suporte

**Status Geral do Projeto:** ⚠️ 57% Implementado  
**Recomendação:** Implementar validações de segurança IMEDIATAMENTE

---

**Gerado em:** 4 de abril de 2026  
**Versão:** 2.0  
**Próxima revisão:** Após implementação das correções
