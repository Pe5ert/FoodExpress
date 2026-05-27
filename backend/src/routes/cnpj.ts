// @ts-nocheck
import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const CLIENT_ID = process.env.GOVBR_CNPJ_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOVBR_CNPJ_CLIENT_SECRET || ''
const CPF_USUARIO = process.env.GOVBR_CNPJ_CPF_USUARIO || ''
const TOKEN_URL = process.env.GOVBR_CNPJ_TOKEN_URL || 'https://apigateway.conectagov.estaleiro.serpro.gov.br/oauth2/jwt-token'
const API_BASE = process.env.GOVBR_CNPJ_API_BASE || 'https://apigateway.conectagov.estaleiro.serpro.gov.br/api-cnpj-empresa/v2/empresa'
const SCOPE = process.env.GOVBR_CNPJ_SCOPE || 'api-cnpj-v1'

const tokenCache: { accessToken: string | null; expiresAt: number } = {
  accessToken: null,
  expiresAt: 0,
}

const validarCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/[^\d]/g, '')
  return digits.length === 14
}

const obterTokenGovBr = async () => {
  if (!CLIENT_ID || !CLIENT_SECRET || !CPF_USUARIO) {
    throw new Error('GOVBR_CNPJ_CLIENT_ID, GOVBR_CNPJ_CLIENT_SECRET e GOVBR_CNPJ_CPF_USUARIO devem ser definidos no backend .env')
  }

  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: SCOPE,
  }).toString()

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body,
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText)
    throw new Error(`Falha ao obter token gov.br: ${res.status} ${errorText}`)
  }

  const data = await res.json().catch(() => null)
  if (!data || !data.access_token || !data.expires_in) {
    throw new Error('Resposta inválida ao obter token gov.br')
  }

  tokenCache.accessToken = data.access_token
  tokenCache.expiresAt = Date.now() + Number(data.expires_in) * 1000
  return tokenCache.accessToken
}

const formatarEndereco = (endereco: any) => {
  if (!endereco) return ''
  return [
    endereco.tipoLogradouro,
    endereco.logradouro,
    endereco.numero,
    endereco.complemento,
    endereco.bairro,
    endereco.municipio?.descricao || endereco.municipio,
    endereco.uf,
  ].filter(Boolean).join(', ')
}

router.get('/consulta', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = String(req.userRole || '').toLowerCase()
    if (!['gerente', 'restaurante', 'operador'].includes(role)) {
      return res.status(403).json({ erro: 'Apenas parceiros podem consultar CNPJ.' })
    }
    const cnpj = String(req.query.cnpj || '').replace(/[^\d]/g, '')
    if (!cnpj || cnpj.length !== 14) {
      return res.status(400).json({ erro: 'CNPJ inválido' })
    }

    const token = await obterTokenGovBr()
    const url = `${API_BASE}/${cnpj}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-cpf-usuario': CPF_USUARIO,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return res.status(response.status).json({ erro: `Erro gov.br: ${errorText}` })
    }

    const data = await response.json()
    const telefone = Array.isArray(data.telefone) && data.telefone.length
      ? `(${data.telefone[0].ddd}) ${data.telefone[0].numero}`
      : ''

    res.json({
      cnpj,
      nomeEmpresarial: data.nomeEmpresarial || '',
      nomeFantasia: data.nomeFantasia || '',
      razaoSocial: data.nomeEmpresarial || '',
      fantasia: data.nomeFantasia || '',
      endereco: formatarEndereco(data.endereco),
      telefone,
      email: data.correioEletronico || '',
      dadosOriginais: data,
    })
  } catch (error) {
    console.error('CNPJ gov.br error:', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    res.status(500).json({ erro: message })
  }
})

export default router
