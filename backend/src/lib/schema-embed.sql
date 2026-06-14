-- Schema SQL embutido — Fallback se database/schema.sql não for encontrado
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
-- ============================================================
-- FoodExpress - Schema MySQL/MariaDB para produção Railway
-- Banco alvo: railway
-- Não use CREATE DATABASE aqui. Execute este arquivo dentro do banco atual.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Restaurantes / lojas
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurantes (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NULL,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(32) NOT NULL,
  endereco TEXT NOT NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  categoria VARCHAR(120) NOT NULL,
  descricao TEXT NULL,
  logo TEXT NULL,
  capa TEXT NULL,
  promo VARCHAR(120) NULL,
  status VARCHAR(50) DEFAULT 'ativo',
  taxa_comissao DOUBLE DEFAULT 15,
  pedido_minimo DOUBLE DEFAULT 0,
  tempo_medio_preparo INT NULL,
  horario_abertura VARCHAR(10) NULL,
  horario_fechamento VARCHAR(10) NULL,
  dias_aberto TEXT NULL,
  formas_pagamento TEXT NULL,
  motivo_rejeicao TEXT NULL,
  senha_hash TEXT NULL,
  avaliacao_media DOUBLE DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_restaurantes_cnpj (cnpj),
  KEY idx_restaurantes_user_id (user_id),
  KEY idx_restaurantes_email (email),
  KEY idx_restaurantes_status (status),
  KEY idx_restaurantes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Gerentes
-- ============================================================
CREATE TABLE IF NOT EXISTS gerentes (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(32) NULL,
  cargo VARCHAR(100) NULL,
  restaurante_id VARCHAR(191) NULL,
  permissoes TEXT NULL,
  status VARCHAR(50) DEFAULT 'ativo',
  senha_hash TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_gerentes_user_id (user_id),
  UNIQUE KEY uq_gerentes_email (email),
  KEY idx_gerentes_restaurante (restaurante_id),
  KEY idx_gerentes_status (status),
  CONSTRAINT fk_gerentes_restaurante
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Operadores
-- ============================================================
CREATE TABLE IF NOT EXISTS operadores (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(32) NULL,
  turno VARCHAR(50) NULL,
  status VARCHAR(50) DEFAULT 'ativo',
  senha_hash TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_operadores_user_id (user_id),
  UNIQUE KEY uq_operadores_email (email),
  KEY idx_operadores_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Entregadores
-- ============================================================
CREATE TABLE IF NOT EXISTS entregadores (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(32) NOT NULL,
  cpf VARCHAR(32) NOT NULL,
  veiculo_tipo VARCHAR(50) NOT NULL,
  veiculo_placa VARCHAR(32) NULL,
  documento_foto TEXT NULL,
  status VARCHAR(50) DEFAULT 'disponivel',
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  ultima_atualizacao DATETIME NULL,
  avaliacao_media DOUBLE DEFAULT 0,
  total_entregas INT DEFAULT 0,
  saldo_disponivel DOUBLE DEFAULT 0,
  saldo_total DOUBLE DEFAULT 0,
  senha_hash TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_entregadores_user_id (user_id),
  UNIQUE KEY uq_entregadores_email (email),
  UNIQUE KEY uq_entregadores_cpf (cpf),
  KEY idx_entregadores_status (status),
  KEY idx_entregadores_ultima_atualizacao (ultima_atualizacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(32) NULL,
  data_nascimento DATE NULL,
  endereco_principal TEXT NULL,
  endereco_label VARCHAR(80) NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  senha_hash TEXT NULL,
  total_pedidos INT DEFAULT 0,
  deletado_em DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_user_id (user_id),
  UNIQUE KEY uq_clientes_email (email),
  KEY idx_clientes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Endereços dos clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS enderecos_clientes (
  id VARCHAR(191) NOT NULL,
  cliente_id VARCHAR(191) NOT NULL,
  label VARCHAR(80) NOT NULL,
  endereco TEXT NOT NULL,
  principal TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_enderecos_cliente (cliente_id),
  KEY idx_enderecos_principal (cliente_id, principal),
  CONSTRAINT fk_enderecos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Cardápio
-- ============================================================
CREATE TABLE IF NOT EXISTS cardapio (
  id VARCHAR(191) NOT NULL,
  restaurante_id VARCHAR(191) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  preco DOUBLE NOT NULL,
  preco_original DOUBLE NULL,
  categoria VARCHAR(120) NOT NULL,
  subcategoria VARCHAR(120) NULL,
  imagem TEXT NULL,
  ingredientes TEXT NULL,
  serve_pessoas INT DEFAULT 1,
  promocao_ativa TINYINT(1) DEFAULT 0,
  promocao_tipo VARCHAR(50) NULL,
  promocao_label VARCHAR(120) NULL,
  combo_itens LONGTEXT NULL,
  disponivel TINYINT(1) DEFAULT 1,
  destaque TINYINT(1) DEFAULT 0,
  tempo_preparo INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cardapio_restaurante (restaurante_id),
  KEY idx_cardapio_categoria (categoria),
  KEY idx_cardapio_disponivel (disponivel),
  CONSTRAINT fk_cardapio_restaurante
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id VARCHAR(191) NOT NULL,
  cliente_id VARCHAR(191) NULL,
  solicitante_id VARCHAR(191) NULL,
  solicitante_tipo VARCHAR(50) NULL,
  solicitante_nome VARCHAR(255) NULL,
  solicitante_email VARCHAR(255) NULL,
  restaurante_id VARCHAR(191) NOT NULL,
  entregador_id VARCHAR(191) NULL,
  status VARCHAR(50) NOT NULL,
  itens LONGTEXT NOT NULL,
  subtotal DOUBLE NOT NULL,
  taxa_entrega DOUBLE NOT NULL,
  desconto DOUBLE DEFAULT 0,
  troco DOUBLE DEFAULT 0,
  total DOUBLE NOT NULL,
  forma_pagamento VARCHAR(80) NOT NULL,
  pagamento_status VARCHAR(50) DEFAULT 'pendente',
  pagamento_id VARCHAR(191) NULL,
  endereco_entrega TEXT NOT NULL,
  latitude_entrega DOUBLE NULL,
  longitude_entrega DOUBLE NULL,
  distancia_km DOUBLE NULL,
  observacoes TEXT NULL,
  tempo_preparo_estimado INT NULL,
  tempo_entrega_estimado INT NULL,
  tempo_total_estimado INT NULL,
  iniciado_em DATETIME NULL,
  confirmado_em DATETIME NULL,
  pronto_em DATETIME NULL,
  coletado_em DATETIME NULL,
  entregue_em DATETIME NULL,
  cancelado_em DATETIME NULL,
  motivo_cancelamento TEXT NULL,
  avaliacao_restaurante INT NULL,
  avaliacao_entregador INT NULL,
  comentario TEXT NULL,
  ganho_entregador DOUBLE DEFAULT 0,
  repasse_entregador_status VARCHAR(50) DEFAULT 'pendente',
  repasse_entregador_em DATETIME NULL,
  oferta_entregador_id VARCHAR(191) NULL,
  oferta_enviada_em DATETIME NULL,
  oferta_expira_em DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pedidos_cliente (cliente_id),
  KEY idx_pedidos_restaurante (restaurante_id),
  KEY idx_pedidos_entregador (entregador_id),
  KEY idx_pedidos_status (status),
  KEY idx_pedidos_created (created_at),
  KEY idx_pedidos_pagamento_id (pagamento_id),
  CONSTRAINT fk_pedidos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_restaurante
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_entregador
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Ofertas exclusivas de entrega
-- ============================================================
CREATE TABLE IF NOT EXISTS ofertas_entrega (
  id VARCHAR(191) NOT NULL,
  pedido_id VARCHAR(191) NOT NULL,
  entregador_id VARCHAR(191) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ofertada',
  expira_em DATETIME NOT NULL,
  respondida_em DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ofertas_pedido (pedido_id),
  KEY idx_ofertas_entregador (entregador_id),
  KEY idx_ofertas_status_expira (status, expira_em),
  UNIQUE KEY uq_oferta_pedido_entregador (pedido_id, entregador_id),
  CONSTRAINT fk_ofertas_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ofertas_entregador
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Rotas / rastreamento
-- ============================================================
CREATE TABLE IF NOT EXISTS rotas (
  id VARCHAR(191) NOT NULL,
  pedido_id VARCHAR(191) NOT NULL,
  entregador_id VARCHAR(191) NOT NULL,
  origem_lat DOUBLE NOT NULL,
  origem_lng DOUBLE NOT NULL,
  destino_lat DOUBLE NOT NULL,
  destino_lng DOUBLE NOT NULL,
  distancia_km DOUBLE NULL,
  duracao_estimada INT NULL,
  pontos_rota LONGTEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rotas_pedido (pedido_id),
  KEY idx_rotas_entregador (entregador_id),
  CONSTRAINT fk_rotas_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rotas_entregador
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Avaliações
-- ============================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
  id VARCHAR(191) NOT NULL,
  cliente_id VARCHAR(191) NOT NULL,
  pedido_id VARCHAR(191) NULL,
  restaurante_id VARCHAR(191) NULL,
  entregador_id VARCHAR(191) NULL,
  estrelas INT NOT NULL,
  comentario TEXT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'restaurante',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_avaliacoes_cliente (cliente_id),
  KEY idx_avaliacoes_pedido (pedido_id),
  KEY idx_avaliacoes_restaurante (restaurante_id),
  KEY idx_avaliacoes_entregador (entregador_id),
  KEY idx_avaliacoes_tipo (tipo),
  CONSTRAINT fk_avaliacoes_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_avaliacoes_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_avaliacoes_restaurante
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_avaliacoes_entregador
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Cupons
-- ============================================================
CREATE TABLE IF NOT EXISTS cupons (
  id VARCHAR(191) NOT NULL,
  codigo VARCHAR(100) NOT NULL,
  desconto DOUBLE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  minimo DOUBLE DEFAULT 0,
  data_expiracao DATETIME NULL,
  ativo TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cupons_codigo (codigo),
  KEY idx_cupons_ativo (ativo),
  KEY idx_cupons_data_expiracao (data_expiracao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cupom_usos (
  id VARCHAR(191) NOT NULL,
  cupom_codigo VARCHAR(100) NOT NULL,
  cliente_id VARCHAR(191) NOT NULL,
  pedido_id VARCHAR(191) NOT NULL,
  usado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cupom_usos_cliente_codigo (cliente_id, cupom_codigo),
  KEY idx_cupom_usos_codigo (cupom_codigo),
  KEY idx_cupom_usos_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Disputas
-- ============================================================
CREATE TABLE IF NOT EXISTS disputas (
  id VARCHAR(191) NOT NULL,
  pedido_id VARCHAR(191) NOT NULL,
  criador_id VARCHAR(191) NOT NULL,
  tipo_reclamante VARCHAR(50) NOT NULL,
  categoria VARCHAR(120) NOT NULL,
  descricao TEXT NOT NULL,
  evidencias TEXT NULL,
  status VARCHAR(50) DEFAULT 'aberta',
  resposta_outra_parte TEXT NULL,
  resolucao TEXT NULL,
  resultado TINYINT(1) NULL,
  motivo_resolucao TEXT NULL,
  operador_responsavel_id VARCHAR(191) NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  respondido_em DATETIME NULL,
  resolvido_em DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_disputas_pedido (pedido_id),
  KEY idx_disputas_criador (criador_id),
  KEY idx_disputas_status (status),
  KEY idx_disputas_operador (operador_responsavel_id),
  CONSTRAINT fk_disputas_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_disputas_operador
    FOREIGN KEY (operador_responsavel_id) REFERENCES operadores(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tickets de suporte
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(191) NOT NULL,
  cliente_id VARCHAR(191) NULL,
  solicitante_id VARCHAR(191) NULL,
  solicitante_tipo VARCHAR(50) NULL,
  solicitante_nome VARCHAR(255) NULL,
  solicitante_email VARCHAR(255) NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(120) NOT NULL,
  pedido_id VARCHAR(191) NULL,
  status VARCHAR(50) DEFAULT 'aberto',
  prioridade VARCHAR(50) DEFAULT 'normal',
  resposta TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tickets_cliente (cliente_id),
  KEY idx_tickets_solicitante (solicitante_id),
  KEY idx_tickets_pedido (pedido_id),
  KEY idx_tickets_status (status),
  CONSTRAINT fk_tickets_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tickets_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Denúncias de produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS denuncias_produtos (
  id VARCHAR(191) NOT NULL,
  produto_id VARCHAR(191) NOT NULL,
  restaurante_id VARCHAR(191) NOT NULL,
  cliente_id VARCHAR(191) NULL,
  produto_nome VARCHAR(255) NULL,
  motivo VARCHAR(255) NOT NULL,
  detalhe TEXT NULL,
  status VARCHAR(50) DEFAULT 'aberta',
  resposta TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_denuncias_produtos_produto (produto_id),
  KEY idx_denuncias_produtos_restaurante (restaurante_id),
  KEY idx_denuncias_produtos_cliente (cliente_id),
  KEY idx_denuncias_produtos_status (status),
  CONSTRAINT fk_denuncias_produto
    FOREIGN KEY (produto_id) REFERENCES cardapio(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_denuncias_restaurante
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_denuncias_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Usuários pendentes / códigos de e-mail
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_pendentes (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(255) NULL,
  nome VARCHAR(255) NULL,
  telefone VARCHAR(32) NULL,
  token VARCHAR(191) NOT NULL,
  codigo VARCHAR(20) NULL,
  codigo_hash TEXT NULL,
  tipo VARCHAR(50) DEFAULT 'email',
  expira_em DATETIME NOT NULL,
  usado TINYINT(1) DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_pendentes_token (token),
  KEY idx_usuarios_pendentes_email (email),
  KEY idx_usuarios_pendentes_tipo (tipo),
  KEY idx_usuarios_pendentes_expira (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Cache de relatórios (tabela prevista para relatórios gerenciais)
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios_cache (
  id VARCHAR(191) NOT NULL,
SET FOREIGN_KEY_CHECKS = 1;
