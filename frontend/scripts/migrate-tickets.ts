import { config } from 'dotenv';
import { db } from '../lib/db';

// Carregar variáveis de ambiente
config({ path: '../.env.local' });

async function migrateTicketsTable() {
  try {
    console.log('Adicionando tabela tickets ao banco...');

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        categoria TEXT NOT NULL,
        pedido_id TEXT,
        status TEXT DEFAULT 'aberto',
        prioridade TEXT DEFAULT 'normal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
      )
    `);

    console.log('✅ Tabela tickets criada com sucesso!');

    // Verificar se a tabela foi criada
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'");
    if (result.rows.length > 0) {
      console.log('✅ Tabela tickets confirmada no banco!');
    } else {
      console.log('❌ Tabela tickets não foi encontrada');
    }

  } catch (error) {
    console.error('Erro na migração:', error);
  }
}

migrateTicketsTable();