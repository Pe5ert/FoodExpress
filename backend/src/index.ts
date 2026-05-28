// @ts-nocheck
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import { rateLimit } from './middleware/rateLimit'
const apiLimiter = rateLimit(100, 60_000)
const authLimiter = rateLimit(12, 60_000)

// Routes
import restaurantesRouter  from './routes/restaurantes'
import cardapioRouter      from './routes/cardapio'
import pedidosRouter       from './routes/pedidos'
import entregadoresRouter  from './routes/entregadores'
import clientesRouter      from './routes/clientes'
import avaliacoesRouter    from './routes/avaliacoes'
import cuponsRouter        from './routes/cupons'
import disputasRouter      from './routes/disputas'
import ticketsRouter       from './routes/tickets'
import denunciasRouter     from './routes/denuncias'
import relatoriosRouter    from './routes/relatorios'
import rotasRouter         from './routes/rotas'
import webhooksRouter      from './routes/webhooks'
import documentosRouter    from './routes/documentos'
import cnpjRouter           from './routes/cnpj'
import authRouter          from './routes/auth'

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3001
const configuredOrigins = (process.env.FRONTEND_URL || 'https://food-express-pearl.vercel.app')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)
const allowedOrigins = [
  ...configuredOrigins,
  'https://food-express-pearl.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

// ── Webhook Stripe precisa do body raw ANTES do express.json() ────────────
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter)

const corsOptions = {
  origin(origin, callback) {
    // Permite requests sem Origin (health checks/curl/apps locais)
    if (!origin) return callback(null, true)
    const normalizedOrigin = origin.replace(/\/$/, '')
    if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true)
    return callback(new Error(`Origin não permitida: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email', 'X-User-Name'],
}

// ── Middlewares globais ───────────────────────────────────────────────────
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()')
  next()
})
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use('/api/', apiLimiter)

// ── Rotas ─────────────────────────────────────────────────────────────────
app.use('/api/restaurantes',  restaurantesRouter)
app.use('/api/cardapio',      cardapioRouter)
app.use('/api/pedidos',       pedidosRouter)
app.use('/api/entregadores',  entregadoresRouter)
app.use('/api/clientes',      clientesRouter)
app.use('/api/avaliacoes',    avaliacoesRouter)
app.use('/api/cupons',        cuponsRouter)
app.use('/api/disputas',      disputasRouter)
app.use('/api/tickets',       ticketsRouter)
app.use('/api/denuncias',     denunciasRouter)
app.use('/api/relatorios',    relatoriosRouter)
app.use('/api/rotas',         rotasRouter)
app.use('/api/documentos',   documentosRouter)
app.use('/api/cnpj',          cnpjRouter)
app.use('/api/auth',          authLimiter, authRouter)

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' })
})

app.listen(PORT, () => {
  console.log(`🚀 FoodExpress Backend rodando na porta ${PORT}`)
})

export default app
