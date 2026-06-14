# Deployment no Railway — Guia de Troubleshooting

## Status Atual

✅ **Schema.sql corrigido** para incluir todas as colunas de `tickets`:
- `solicitante_id`, `solicitante_tipo`, `solicitante_nome`, `solicitante_email`

✅ **Backend schema validation melhorado** (`backend/src/lib/schema.ts`):
- Logging detalhado de aplicação de schema
- Mensagens claras quando tabelas estão faltando
- Sugestões de ação quando auto-migration falha

## Erro Atual no Railway

```
Table 'railway.restaurantes' doesn't exist
```

### Causa Provável

O banco de dados `railway` foi criado, mas as tabelas não foram inicializadas. Isso pode ocorrer quando:

1. **Variáveis de ambiente não configuradas corretamente no Railway** — o backend não consegue conectar ao banco
2. **`schema.sql` não encontrado** — o arquivo não está nos caminhos esperados durante build
3. **Permissões insuficientes** — o usuário do banco não tem permissão para criar tabelas

## Solução

### 1️⃣ Verifique as Variáveis de Ambiente no Railway

No painel do Railway, adicione essas variáveis ao serviço **backend**:

```
DB_HOST=<seu-host-mysql-railway>
DB_PORT=3306
DB_USER=<seu-usuario>
DB_PASSWORD=<sua-senha>
MYSQLDATABASE=railway
```

**Como encontrar essas informações:**

- Se você tem um serviço MySQL/MariaDB no Railway, clique nele e vá em **"Variables"**
- Copie os valores de:
  - `MYSQLHOST` → `DB_HOST`
  - `MYSQLPORT` → `DB_PORT` (normalmente 3306)
  - `MYSQLUSER` → `DB_USER`
  - `MYSQLPASSWORD` → `DB_PASSWORD`
  - `MYSQLDATABASE` → `MYSQLDATABASE` (normalmente `railway`)

Alternativamente, procure por `MYSQL_URL`, `MARIADB_URL`, ou `DATABASE_URL` (conexão em formato URL).

### 2️⃣ Confirme que `schema.sql` Está no Build

Verifique se o arquivo está em um dos caminhos esperados:

```
database/schema.sql    ← preferido
../database/schema.sql
schema.sql
../schema.sql
```

**No Railway**, o `process.cwd()` do backend é `/app`, portanto o arquivo precisa estar em um desses locais relativos:

- `/app/database/schema.sql` ← melhor
- `/app/schema.sql`

Verifique o `railway.json` do seu build:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "NODE_ENV=development npm install && npm run build"
  }
}
```

Se necessário, aumente o buildCommand para copiar o arquivo:

```json
"buildCommand": "NODE_ENV=development npm install && npm run build && cp -r database /app/ || true"
```

### 3️⃣ Força Manual do Schema no Railway (Opcional)

Se não conseguir fazer a auto-migration funcionar, você pode executar manualmente:

**Opção A: Usar o Railway CLI**

```bash
railway run npm run schema
```

**Opção B: Conectar via SSH e executar**

```bash
railway ssh

# Dentro do container:
cd /app && npm run schema
```

**Opção C: Usar um script de init**

Modifique o `railway.json` para rodar schema antes do start:

```json
{
  "deploy": {
    "startCommand": "npm run schema && npm start"
  }
}
```

## Validação Após Deploy

1. Veja os logs do Railway durante o startup
2. Procure por mensagens como:
   - ✅ `Estrutura do banco validada sem popular dados`
   - 📄 `schema.sql encontrado: ...`
   - ✅ `Schema aplicado: X criados, Y já existentes, Z erros`

Se vir erros como `❌ Tabela ausente detectada`, o schema não foi aplicado completamente.

## Próximos Passos

1. Configure as variáveis de ambiente do banco no Railway
2. Redeploy o backend
3. Monitore os logs
4. Se persistir, execute manualmente `npm run schema` via Railway CLI

---

**Última atualização:** 2026-06-14
