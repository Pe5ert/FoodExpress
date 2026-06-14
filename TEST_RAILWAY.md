# Teste de Conectividade do Backend Railway

## Passo 1: Verifique Health Check
```bash
curl -i https://foodexpress-production-c874.up.railway.app/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "database": "ready"
}
```

## Passo 2: Se o health check funcionar, teste restaurantes
```bash
curl -i https://foodexpress-production-c874.up.railway.app/api/restaurantes?limite=5
```

**Resultado esperado:**
- Status 200
- Headers incluem: `access-control-allow-origin: *` ou sua origem Vercel
- Body: Array de restaurantes

## Passo 3: Se falhar, verifique logs no Railway
1. Acesse https://railway.app
2. Vá para o projeto FoodExpress
3. Clique em "Backend"
4. Vá para "Logs" e procure por:
   - Erros de conexão com banco de dados
   - Erros na inicialização
   - Erros de autenticação

## Passo 4: Verifique variáveis de ambiente
Certifique-se de que no Railway estão configuradas:
- `DB_HOST` 
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `MYSQLDATABASE`
- `FRONTEND_URL=https://food-express-pearl.vercel.app`

## Passo 5: Se o servidor está offline
Redeploy do backend:
1. Faz commit no git: `git push` 
2. Railway vai fazer redeploy automático
3. Acompanhe os logs para ver se inicia corretamente

---

**Se o health check retornar com sucesso**, o problema é específico do endpoint `/api/restaurantes`.
**Se o health check falhar**, o backend não está respondendo corretamente.
