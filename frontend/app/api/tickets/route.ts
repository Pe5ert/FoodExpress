import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET - Listar tickets
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = 'SELECT * FROM tickets WHERE cliente_id = ?'
    const args: any[] = [userId]

    if (status) {
      sql += ' AND status = ?'
      args.push(status)
    }

    sql += ' ORDER BY created_at DESC LIMIT 50'

    const tickets = await db.execute({ sql, args })
    return NextResponse.json(tickets.rows)
  } catch (erro) {
    console.error('Erro:', erro)
    return NextResponse.json(
      { erro: 'Erro ao listar tickets' },
      { status: 500 }
    )
  }
}

// POST - Criar ticket
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, descricao, categoria, pedidoId } = body

    if (!titulo || !descricao || !categoria) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO tickets
            (id, cliente_id, titulo, descricao, categoria, pedido_id, status, prioridade, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, userId, titulo, descricao, categoria, pedidoId || null, 'aberto', 'normal', new Date().toISOString()]
    });

    return NextResponse.json(
      {
        mensagem: 'Ticket criado com sucesso',
        id: id
      },
      { status: 201 }
    )
  } catch (erro) {
    console.error('Erro ao criar ticket:', erro)
    return NextResponse.json(
      { erro: 'Erro ao criar ticket' },
      { status: 500 }
    )
  }
}
