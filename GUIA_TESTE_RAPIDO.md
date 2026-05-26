# 🚀 Guia de Teste Rápido - FoodExpress Backend

**Após as correções implementadas**

---

## ✅ Verificação Rápida

### 1. Compilação
```bash
cd /Users/joaopedro/FoodExpress/backend
npm run build
# Esperado: Sem erros
```

### 2. Iniciação do Dev Server
```bash
npm run dev
# Esperado: Servidor rodando em http://localhost:3001
```

### 3. Health Check
```bash
curl http://localhost:3001/health
# Esperado: {"status": "ok", "timestamp": "..."}
```

---

## 🧪 Testes de Endpoints Novos

### Avaliacoes
```bash
# GET especifica
curl -X GET http://localhost:3001/api/avaliacoes/aval_test123 \
  -H "Authorization: Bearer JWT_TOKEN"

# PUT atualizar
curl -X PUT http://localhost:3001/api/avaliacoes/aval_test123 \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estrelas": 5, "comentario": "Excelente!"}'

# DELETE remover
curl -X DELETE http://localhost:3001/api/avaliacoes/aval_test123 \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Cupons
```bash
# POST criar (gerente)
curl -X POST http://localhost:3001/api/cupons \
  -H "Authorization: Bearer GERENTE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "DESC50",
    "desconto": 50,
    "tipo": "percentual",
    "minimo": 100
  }'

# GET especifico
curl -X GET http://localhost:3001/api/cupons/cupom_id_123 \
  -H "Authorization: Bearer JWT_TOKEN"

# PUT atualizar
curl -X PUT http://localhost:3001/api/cupons/cupom_id_123 \
  -H "Authorization: Bearer GERENTE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"desconto": 60}'

# DELETE desativar
curl -X DELETE http://localhost:3001/api/cupons/cupom_id_123 \
  -H "Authorization: Bearer GERENTE_JWT_TOKEN"
```

### Tickets
```bash
# GET especifico
curl -X GET http://localhost:3001/api/tickets/ticket_id_123 \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"

# PUT atualizar
curl -X PUT http://localhost:3001/api/tickets/ticket_id_123 \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolvido", "resposta": "Problema resolvido!"}'

# DELETE fechar
curl -X DELETE http://localhost:3001/api/tickets/ticket_id_123 \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"
```

### Clientes
```bash
# DELETE remover
curl -X DELETE http://localhost:3001/api/clientes/cli_user123 \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"
```

---

## 🔒 Testes de Segurança

### 1. Validação de Role (deve falhar)
```bash
# Cliente tentando criar cupom (deve retornar 403)
curl -X POST http://localhost:3001/api/cupons \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"codigo": "TEST", "desconto": 10, "tipo": "percentual"}'

# Esperado: {"erro": "Apenas gerentes podem criar cupons"}
```

### 2. Validação de Propriedade (deve falhar)
```bash
# Cliente A tentando acessar ticket do Cliente B
curl -X GET http://localhost:3001/api/tickets/outro_cliente_ticket_id \
  -H "Authorization: Bearer CLIENTE_A_JWT_TOKEN"

# Esperado: {"erro": "Ticket não encontrado"}
```

### 3. Sem Autenticação (deve falhar)
```bash
curl -X GET http://localhost:3001/api/cupons/cupom123

# Esperado: {"erro": "Token não fornecido"}
```

---

## 📊 Testes de Validação de Dados

### 1. Campos Obrigatórios (deve falhar)
```bash
curl -X POST http://localhost:3001/api/avaliacoes \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estrelas": 5}'

# Esperado: {"erro": "Dados inválidos"}
```

### 2. Valores Inválidos (deve falhar)
```bash
curl -X POST http://localhost:3001/api/avaliacoes \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pedidoId": "123", "estrelas": 10, "tipo": "restaurante"}'

# Esperado: {"erro": "Dados inválidos"}
```

---

## 🗄️ Testes de Banco de Dados

### Verificar Colunas Adicionadas
```sql
-- SSH para banco ou via CLI do Turso

-- Tickets
PRAGMA table_info(tickets);
-- Deve ter: resposta, updated_at

-- Clientes
PRAGMA table_info(clientes);
-- Deve ter: deletado_em

-- Cupons
PRAGMA table_info(cupons);
-- Deve ter: ativo
```

---

## 📈 Testes de Performance

### 1. Rate Limiting
```bash
# Fazer 101 requisições (a 101ª deve falhar)
for i in {1..101}; do
  curl -s http://localhost:3001/health > /dev/null
  echo "Request $i"
done

# Esperado: 12ª requisição falha com 429 Too Many Requests
```

### 2. Query com Filtros
```bash
# GET com filtros deve ser rápido
curl -X GET "http://localhost:3001/api/avaliacoes?restauranteId=rest_123&tipo=restaurante" \
  -H "Authorization: Bearer JWT_TOKEN"

# Esperado: < 100ms response time
```

---

## 🔍 Monitoramento de Logs

### 1. Ver Logs do Dev Server
```bash
# Terminal rodando npm run dev deve mostrar:
✅ Schema validado automaticamente
✅ ➕ Coluna criada: tickets.resposta
✅ ➕ Coluna criada: tickets.updated_at
✅ ➕ Coluna criada: clientes.deletado_em
```

### 2. Erros de Compilação
```bash
npm run build 2>&1 | grep -i error
# Esperado: Sem output (sem erros)
```

---

## 📋 Checklist de Validação

- [ ] Build sem erros
- [ ] Server inicia
- [ ] Health check funciona
- [ ] GET /api/avaliacoes/:id retorna 200
- [ ] PUT /api/avaliacoes/:id retorna 200
- [ ] DELETE /api/avaliacoes/:id retorna 200
- [ ] POST /api/cupons sem gerente retorna 403
- [ ] GET /api/cupons/:id retorna 200
- [ ] PUT /api/cupons/:id retorna 200
- [ ] DELETE /api/cupons/:id retorna 200
- [ ] GET /api/tickets/:id retorna 200
- [ ] PUT /api/tickets/:id retorna 200
- [ ] DELETE /api/tickets/:id retorna 200
- [ ] DELETE /api/clientes/:id retorna 200
- [ ] Colunas novas existem no banco

---

## 🆘 Troubleshooting

### Erro: Database connection failed
**Solução:** Verificar `DATABASE_URL` e `JWT_SECRET` em `.env`

### Erro: Token inválido
**Solução:** Gerar novo token via POST `/api/auth/login`

### Erro: Coluna não existe
**Solução:** Rodar `npm run dev` uma vez para migrations automáticas executarem

### Erro: 403 Acesso não permitido
**Solução:** Verificar role do usuário no JWT token

---

## 🎯 Resultado Esperado

Após rodar todos os testes:

```
✅ 9 novos endpoints funcionando
✅ Validações de segurança em lugar
✅ Banco de dados atualizado
✅ Soft deletes funcionando
✅ RBAC validando corretamente
✅ Rate limiting ativo
✅ Sem erros de compilação
✅ Pronto para homologação
```

---

## 📞 Próximos Passos

1. **Executar testes** com os comandos acima
2. **Validar banco de dados** com queries SQL
3. **Testar segurança** tentando falhas de autorização
4. **Deploy para staging** para QA
5. **Deploy para produção** após aprovação

**Boa sorte! 🚀**
