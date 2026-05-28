import { config } from 'dotenv'
import { db } from '../src/lib/db'
import { ensureDatabaseHealth, vincularRestauranteAoUsuario } from '../src/lib/schema'
import { hashSenha } from '../src/lib/password'

config()

const SENHA_DEMO = process.env.SEED_DEMO_PASSWORD || '123456'
const SENHA_DEMO_HASH = hashSenha(SENHA_DEMO)

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const pagamentos = ['Dinheiro', 'Crédito', 'Débito', 'Pix']

function dataSql(horasAtras: number) {
  return new Date(Date.now() - horasAtras * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
}

function cpfFake(n: number) {
  return `00000000${String(n).padStart(3, '0')}`.slice(-11)
}

function placaFake(n: number) {
  const letras = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG', 'HHH'][n % 8]
  return `${letras}${(1000 + n).toString().slice(-4)}`
}

function slug(valor: string) {
  return String(valor || 'x').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40)
}

async function inserirBase() {
  const restaurantes = [
    { id: 'rest_seed_pizza', user_id: 'gerente-pizza-bella', nome: 'Pizza Bella', cnpj: '12345678000190', email: 'gerente@pizzabella.com', telefone: '(85) 99999-0001', endereco: 'Av. Beira Mar, 1200 - Meireles, Fortaleza', latitude: -3.7202, longitude: -38.4896, categoria: 'Pizzas', descricao: 'Pizzas artesanais com massa de fermentação lenta.', logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', capa: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200', status: 'ativo', avaliacao_media: 4.8, tempo_medio_preparo: 28 },
    { id: 'rest_seed_burger', user_id: 'gerente-burger-house', nome: 'Burger House', cnpj: '98765432000110', email: 'gerente@burgerhouse.com', telefone: '(85) 99999-0002', endereco: 'Rua Osvaldo Cruz, 650 - Aldeota, Fortaleza', latitude: -3.7374, longitude: -38.5023, categoria: 'Hambúrgueres', descricao: 'Hambúrgueres smash e artesanais.', logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', capa: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200', status: 'ativo', avaliacao_media: 4.7, tempo_medio_preparo: 22 },
    { id: 'rest_seed_sushi', user_id: 'gerente-sushi-express', nome: 'Sushi Express', cnpj: '11222333000144', email: 'gerente@sushiexpress.com', telefone: '(85) 99999-0003', endereco: 'Av. Santos Dumont, 2500 - Aldeota, Fortaleza', latitude: -3.7336, longitude: -38.4975, categoria: 'Japonesa', descricao: 'Combinados, temakis e pratos quentes.', logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', capa: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200', status: 'ativo', avaliacao_media: 4.6, tempo_medio_preparo: 25 },
    { id: 'rest_seed_acai', user_id: 'gerente-acai-norte', nome: 'Açaí do Norte', cnpj: '55666777000188', email: 'gerente@acaidonorte.com', telefone: '(85) 99999-0004', endereco: 'Rua Ana Bilhar, 900 - Varjota, Fortaleza', latitude: -3.7298, longitude: -38.4932, categoria: 'Açaí e Sobremesas', descricao: 'Açaí cremoso, cupuaçu e sobremesas geladas.', logo: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', capa: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=1200', status: 'ativo', avaliacao_media: 4.9, tempo_medio_preparo: 15 },
    { id: 'rest_seed_cafe', user_id: 'gerente-cafe-cia', nome: 'Café & Cia', cnpj: '99888777000166', email: 'gerente@cafecia.com', telefone: '(85) 99999-0005', endereco: 'Praça Portugal, 45 - Aldeota, Fortaleza', latitude: -3.7411, longitude: -38.4939, categoria: 'Cafeteria', descricao: 'Cafés especiais, croissants e tortas.', logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', capa: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', status: 'fechado', avaliacao_media: 4.5, tempo_medio_preparo: 12 },
    { id: 'rest_seed_taco', user_id: 'gerente-taco-al-pastor', nome: 'Taco Al Pastor', cnpj: '22333444000155', email: 'gerente@tacoalpastor.com', telefone: '(85) 99999-0006', endereco: 'Rua República do Líbano, 720 - Meireles, Fortaleza', latitude: -3.7304, longitude: -38.4876, categoria: 'Mexicana', descricao: 'Tacos, burritos e nachos com molhos artesanais.', logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', capa: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=1200', status: 'ativo', avaliacao_media: 4.7, tempo_medio_preparo: 20 },
    { id: 'rest_seed_massa', user_id: 'gerente-massa-porto', nome: 'Massa do Porto', cnpj: '33444555000166', email: 'gerente@massadoporto.com', telefone: '(85) 99999-0007', endereco: 'Av. Historiador Raimundo Girão, 1100 - Praia de Iracema, Fortaleza', latitude: -3.7219, longitude: -38.5128, categoria: 'Massas', descricao: 'Massas frescas, risotos e pratos italianos.', logo: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400', capa: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200', status: 'ativo', avaliacao_media: 4.6, tempo_medio_preparo: 26 },
    { id: 'rest_seed_fit', user_id: 'gerente-fit-bowl', nome: 'Fit Bowl', cnpj: '44555666000177', email: 'gerente@fitbowl.com', telefone: '(85) 99999-0008', endereco: 'Rua Leonardo Mota, 1300 - Aldeota, Fortaleza', latitude: -3.7395, longitude: -38.4955, categoria: 'Saudável', descricao: 'Bowls, saladas e refeições balanceadas.', logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', capa: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200', status: 'ativo', avaliacao_media: 4.8, tempo_medio_preparo: 18 },
  ]

  for (const r of restaurantes) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO restaurantes
            (id, user_id, nome, cnpj, email, telefone, endereco, latitude, longitude, categoria, descricao, logo, capa, status,
             taxa_comissao, tempo_medio_preparo, horario_abertura, horario_fechamento, dias_aberto, formas_pagamento, avaliacao_media, senha_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 15, ?, '18:00', '23:00', ?, ?, ?, ?)`,
      args: [r.id, r.user_id, r.nome, r.cnpj, r.email, r.telefone, r.endereco, r.latitude, r.longitude, r.categoria, r.descricao, r.logo, r.capa, r.status, r.tempo_medio_preparo, JSON.stringify(dias), JSON.stringify(pagamentos), r.avaliacao_media, SENHA_DEMO_HASH]
    })
    await vincularRestauranteAoUsuario(r.id, r.user_id, r.email, r.nome)
    await db.execute({ sql: 'UPDATE gerentes SET senha_hash = ? WHERE restaurante_id = ? OR user_id = ?', args: [SENHA_DEMO_HASH, r.id, r.user_id] })
  }
}

async function inserirClientes() {
  const clientes = [
    ['cli_seed_001', 'cliente-ana', 'Ana Souza', 'ana.cliente@demo.com', '(85) 98888-0001', 'Rua João Cordeiro, 100 - Praia de Iracema', -3.7184, -38.5141],
    ['cli_seed_002', 'cliente-pedro', 'Pedro Lima', 'pedro.cliente@demo.com', '(85) 98888-0002', 'Av. Dom Luís, 500 - Aldeota', -3.7351, -38.4938],
    ['cli_seed_003', 'cliente-maria', 'Maria Oliveira', 'maria.cliente@demo.com', '(85) 98888-0003', 'Rua Silva Paulet, 850 - Meireles', -3.7261, -38.4933],
    ['cli_seed_004', 'cliente-joao', 'João Pereira', 'joao.cliente@demo.com', '(85) 98888-0004', 'Rua Costa Barros, 300 - Centro', -3.7280, -38.5250],
    ['cli_seed_005', 'cliente-bia', 'Beatriz Alves', 'bia.cliente@demo.com', '(85) 98888-0005', 'Av. Abolição, 2400 - Meireles', -3.7242, -38.4901],
    ['cli_seed_006', 'cliente-carlos', 'Carlos Mendes', 'carlos.cliente@demo.com', '(85) 98888-0006', 'Rua Barbosa de Freitas, 1300 - Aldeota', -3.7420, -38.4971],
    ['cli_seed_007', 'cliente-larissa', 'Larissa Rocha', 'larissa.cliente@demo.com', '(85) 98888-0007', 'Rua Carlos Vasconcelos, 420 - Meireles', -3.7289, -38.4988],
    ['cli_seed_008', 'cliente-matheus', 'Matheus Costa', 'matheus.cliente@demo.com', '(85) 98888-0008', 'Av. Rui Barbosa, 1500 - Aldeota', -3.7441, -38.5022],
    ['cli_seed_009', 'cliente-renata', 'Renata Martins', 'renata.cliente@demo.com', '(85) 98888-0009', 'Rua Padre Valdevino, 640 - Joaquim Távora', -3.7409, -38.5146],
    ['cli_seed_010', 'cliente-diego', 'Diego Nunes', 'diego.cliente@demo.com', '(85) 98888-0010', 'Rua Tibúrcio Cavalcante, 1700 - Dionísio Torres', -3.7520, -38.5004],
  ]
  for (const c of clientes) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO clientes (id, user_id, nome, email, telefone, endereco_principal, latitude, longitude, senha_hash, total_pedidos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      args: [...c, SENHA_DEMO_HASH]
    })
  }
}

async function inserirOperadorDemo() {
  await db.execute({
    sql: `INSERT OR REPLACE INTO operadores (id, user_id, nome, email, telefone, turno, status, senha_hash)
          VALUES (?, ?, ?, ?, ?, ?, 'ativo', ?)`,
    args: ['op_demo_master', 'operador-demo', 'Operador Demo', 'operador@demo.com', '(85) 96666-0001', 'geral', SENHA_DEMO_HASH]
  })
}

async function inserirEntregadores() {
  const entregadores = [
    ['ent_seed_001', 'entregador-bola', 'Bola Entregas', 'bola.entregador@demo.com', '(85) 97777-0001', cpfFake(1), 'moto', 'ABC1D23', 'disponivel', -3.7332, -38.5001, 4.9, 42],
    ['ent_seed_002', 'entregador-rafa', 'Rafa Motoboy', 'rafa.entregador@demo.com', '(85) 97777-0002', cpfFake(2), 'moto', placaFake(2), 'disponivel', -3.7288, -38.4960, 4.8, 35],
    ['ent_seed_003', 'entregador-luiz', 'Luiz Bike', 'luiz.bike@demo.com', '(85) 97777-0003', cpfFake(3), 'bicicleta', '', 'disponivel', -3.7212, -38.5100, 4.7, 21],
    ['ent_seed_004', 'entregador-tais', 'Taís Entregadora', 'tais.entregas@demo.com', '(85) 97777-0004', cpfFake(4), 'moto', placaFake(4), 'ocupado', -3.7400, -38.5010, 4.6, 18],
    ['ent_seed_005', 'entregador-nina', 'Nina Express', 'nina.entregas@demo.com', '(85) 97777-0005', cpfFake(5), 'bicicleta', '', 'disponivel', -3.7250, -38.5070, 4.9, 27],
    ['ent_seed_006', 'entregador-vitor', 'Vitor Moto', 'vitor.moto@demo.com', '(85) 97777-0006', cpfFake(6), 'moto', placaFake(6), 'disponivel', -3.7367, -38.4908, 4.7, 31],
  ]
  for (const e of entregadores) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO entregadores
            (id, user_id, nome, email, telefone, cpf, veiculo_tipo, veiculo_placa, status, latitude, longitude, ultima_atualizacao, avaliacao_media, total_entregas, senha_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)`,
      args: [...e, SENHA_DEMO_HASH]
    })
  }
}

function produtosPara(rest: any) {
  const cat = String(rest.categoria || '').toLowerCase()
  if (cat.includes('pizza')) return [
    ['Pizza Margherita', 'Molho artesanal, mussarela e manjericão', 35.9, 'Pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'],
    ['Pizza Calabresa', 'Calabresa, cebola roxa e orégano', 38.9, 'Pizzas', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600'],
    ['Refrigerante 1L', 'Bebida gelada', 9.9, 'Bebidas', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600'],
  ]
  if (cat.includes('hamb')) return [
    ['Classic Burger', 'Pão brioche, blend 160g e cheddar', 28.9, 'Hambúrgueres', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'],
    ['Bacon Burger', 'Blend, cheddar e bacon crocante', 32.9, 'Hambúrgueres', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600'],
    ['Batata Frita', 'Porção crocante com molho da casa', 14.9, 'Acompanhamentos', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600'],
  ]
  if (cat.includes('jap')) return [
    ['Combo 20 peças', 'Sushis e sashimis variados', 49.9, 'Combos', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600'],
    ['Temaki Salmão', 'Salmão, cream cheese e cebolinha', 22.9, 'Temakis', 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600'],
    ['Yakisoba', 'Legumes, carne e molho oriental', 27.9, 'Pratos quentes', 'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=600'],
  ]
  if (cat.includes('aça') || cat.includes('sobrem')) return [
    ['Açaí 500ml', 'Açaí cremoso com banana e granola', 24.9, 'Açaí', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600'],
    ['Cupuaçu 400ml', 'Cupuaçu batido com leite condensado', 21.9, 'Cremes', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600'],
    ['Brownie', 'Brownie de chocolate meio amargo', 12.9, 'Sobremesas', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600'],
  ]
  if (cat.includes('café') || cat.includes('cafe')) return [
    ['Café Latte', 'Espresso com leite vaporizado', 12.9, 'Cafés', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600'],
    ['Croissant', 'Croissant folhado na manteiga', 11.9, 'Padaria', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600'],
    ['Torta de Limão', 'Massa crocante e creme cítrico', 16.9, 'Doces', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600'],
  ]
  return [
    ['Prato Executivo', 'Arroz, feijão, proteína e salada', 29.9, 'Pratos', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'],
    ['Suco Natural', 'Suco feito na hora', 9.9, 'Bebidas', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600'],
    ['Sobremesa da Casa', 'Doce do dia', 12.9, 'Sobremesas', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600'],
  ]
}

async function inserirCardapioParaTodos() {
  const restaurantes = await db.execute(`SELECT id, nome, categoria FROM restaurantes WHERE COALESCE(status,'ativo') IN ('ativo','fechado')`)
  for (const rest of restaurantes.rows as any[]) {
    const itens = produtosPara(rest)
    for (let i = 0; i < itens.length; i++) {
      const [nome, descricao, preco, categoria, imagem] = itens[i]
      await db.execute({
        sql: `INSERT OR REPLACE INTO cardapio
              (id, restaurante_id, nome, descricao, preco, categoria, imagem, disponivel, destaque, tempo_preparo)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        args: [`item_seed_${slug(rest.id)}_${i+1}`, rest.id, nome, descricao, preco, categoria, imagem, i === 0 ? 1 : 0, 12 + i * 5]
      })
    }
  }
}

async function inserirPedidosEAvaliacoes() {
  const restaurantes = (await db.execute(`SELECT id, nome, latitude, longitude FROM restaurantes WHERE COALESCE(status,'ativo') IN ('ativo','fechado')`)).rows as any[]
  const clientes = (await db.execute(`SELECT * FROM clientes ORDER BY id`)).rows as any[]
  const entregadores = (await db.execute(`SELECT * FROM entregadores ORDER BY id`)).rows as any[]

  for (const [ri, rest] of restaurantes.entries()) {
    const itens = (await db.execute({ sql: 'SELECT * FROM cardapio WHERE restaurante_id = ? ORDER BY id', args: [rest.id] })).rows as any[]
    if (!itens.length) continue

    for (let i = 0; i < 14; i++) {
      const cliente = clientes[(i + ri) % clientes.length]
      const entregador = entregadores[(i + ri) % entregadores.length]
      const item = itens[i % itens.length]
      const qtd = (i % 3) + 1
      const subtotal = Number(item.preco) * qtd
      const taxa = i % 5 === 0 ? 0 : 5 + (i % 3) * 2
      const desconto = i % 6 === 0 ? 5 : 0
      const total = Number((subtotal + taxa - desconto).toFixed(2))
      const status = i % 7 === 0 ? 'cancelado' : i % 5 === 0 ? 'entregando' : i % 4 === 0 ? 'preparando' : 'entregue'
      const pedidoId = `ped_seed_${slug(rest.id)}_${String(i + 1).padStart(2, '0')}`
      const criado = dataSql(ri * 8 + i * 9 + 1)
      const itensJson = JSON.stringify([{ id: item.id, cardapioId: item.id, nome: item.nome, quantidade: qtd, preco: Number(item.preco) }])
      const precisaEntregador = ['entregue', 'entregando'].includes(status)
      await db.execute({
        sql: `INSERT OR REPLACE INTO pedidos
              (id, cliente_id, restaurante_id, entregador_id, status, itens, subtotal, taxa_entrega, desconto, total,
               forma_pagamento, pagamento_status, endereco_entrega, latitude_entrega, longitude_entrega, distancia_km,
               tempo_preparo_estimado, tempo_entrega_estimado, tempo_total_estimado, created_at, updated_at, motivo_cancelamento,
               avaliacao_restaurante, avaliacao_entregador, comentario)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aprovado', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          pedidoId, cliente.id, rest.id, precisaEntregador ? entregador.id : null, status, itensJson,
          subtotal, taxa, desconto, total, pagamentos[i % pagamentos.length], cliente.endereco_principal,
          cliente.latitude, cliente.longitude, 1.2 + (i % 7) * 0.6, 15 + (i % 4) * 5, 12 + (i % 5) * 4, 30 + (i % 5) * 5,
          criado, criado, status === 'cancelado' ? ['Cliente desistiu', 'Loja sem estoque', 'Tempo alto'][i % 3] : null,
          status === 'entregue' ? 4 + (i % 2) : null, status === 'entregue' ? 4 + ((i + 1) % 2) : null,
          status === 'entregue' ? ['Muito bom', 'Entrega rápida', 'Produto chegou quente'][i % 3] : null,
        ]
      })

      if (status === 'entregue') {
        await db.execute({
          sql: `INSERT OR REPLACE INTO rotas
                (id, pedido_id, entregador_id, origem_lat, origem_lng, destino_lat, destino_lng, distancia_km, duracao_estimada, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [`rota_${pedidoId}`, pedidoId, entregador.id, rest.latitude || -3.73, rest.longitude || -38.5, cliente.latitude, cliente.longitude, 1.2 + (i % 7) * 0.6, 12 + (i % 5) * 4, criado]
        })
        await db.execute({
          sql: `INSERT OR REPLACE INTO avaliacoes
                (id, cliente_id, pedido_id, restaurante_id, entregador_id, estrelas, comentario, tipo, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'restaurante', ?)`,
          args: [`av_rest_${pedidoId}`, cliente.id, pedidoId, rest.id, entregador.id, 4 + (i % 2), ['Muito bom', 'Gostei do atendimento', 'Comida excelente'][i % 3], criado]
        })
        await db.execute({
          sql: `INSERT OR REPLACE INTO avaliacoes
                (id, cliente_id, pedido_id, restaurante_id, entregador_id, estrelas, comentario, tipo, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'entregador', ?)`,
          args: [`av_ent_${pedidoId}`, cliente.id, pedidoId, rest.id, entregador.id, 4 + ((i + 1) % 2), ['Entregador educado', 'Chegou rápido', 'Boa comunicação'][i % 3], criado]
        })
      }
    }
  }
}

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...')
  await ensureDatabaseHealth()
  await inserirBase()
  await inserirClientes()
  await inserirOperadorDemo()
  await inserirEntregadores()
  await inserirCardapioParaTodos()
  await inserirPedidosEAvaliacoes()

  await db.execute(`UPDATE clientes SET total_pedidos = (
    SELECT COUNT(*) FROM pedidos p WHERE p.cliente_id = clientes.id
  )`)
  await db.execute(`UPDATE entregadores SET total_entregas = (
    SELECT COUNT(*) FROM pedidos p WHERE p.entregador_id = entregadores.id AND p.status = 'entregue'
  )`)
  await db.execute(`UPDATE restaurantes SET avaliacao_media = COALESCE((
    SELECT ROUND(AVG(estrelas), 2) FROM avaliacoes a WHERE a.restaurante_id = restaurantes.id AND a.tipo = 'restaurante'
  ), avaliacao_media)`)

  console.log('✅ Restaurantes, cardápios, clientes, entregadores, pedidos, rotas e avaliações inseridos')
  console.log(`🔐 Senha demo para exemplos: ${SENHA_DEMO}`)
  console.log('🎉 Seed concluído!')
}

seedDatabase().catch(e => {
  console.error('Erro no seed:', e)
  process.exit(1)
})
