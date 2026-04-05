import { config } from 'dotenv';
import { db } from '../lib/db';

// Carregar variáveis de ambiente
config({ path: '../.env.local' });

async function testAPI() {
  try {
    console.log('Testando query da API de restaurantes...');

    // Mesma query da API
    let sql = 'SELECT * FROM restaurantes WHERE status = ?'
    const args: any[] = ['ativo']

    sql += ' ORDER BY created_at DESC LIMIT ?'
    args.push(50)

    const result = await db.execute({
      sql,
      args
    });

    console.log(`Encontrados ${result.rows.length} restaurantes:`);
    result.rows.forEach(r => {
      console.log(`- ${r.nome} (${r.categoria}) - Status: ${r.status}`);
    });

    // Testar cardápio
    console.log('\nTestando cardápio...');
    const cardapioResult = await db.execute({
      sql: 'SELECT * FROM cardapio WHERE restaurante_id = ?',
      args: ['rest-001']
    });

    console.log(`Cardápio da Pizza Bella: ${cardapioResult.rows.length} itens`);
    cardapioResult.rows.forEach(item => {
      console.log(`- ${item.nome}: R$ ${item.preco}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  }
}

testAPI();