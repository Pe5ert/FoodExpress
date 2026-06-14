-- Schema SQL embutido — Fallback se database/schema.sql não for encontrado
-- Este arquivo é usado pelo backend se o schema.sql da raiz não estiver disponível

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS restaurantes (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  email VARCHAR(191) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  endereco TEXT,
  latitude DOUBLE,
  longitude DOUBLE,
  categoria VARCHAR(120),
  descricao TEXT,
  logo TEXT,
  capa TEXT,
  promo VARCHAR(120),
  status VARCHAR(50) DEFAULT 'pendente',
  taxa_comissao DOUBLE DEFAULT 15,
  pedido_minimo DOUBLE DEFAULT 0,
  tempo_medio_preparo INT DEFAULT 30,
  horario_abertura VARCHAR(10),
  horario_fechamento VARCHAR(10),
  dias_aberto TEXT,
  formas_pagamento TEXT,
  motivo_rejeicao TEXT,
  senha_hash TEXT,
  avaliacao_media DOUBLE DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_restaurantes_email (email),
  KEY idx_restaurantes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(191) UNIQUE,
  telefone VARCHAR(20),
  data_nascimento VARCHAR(10),
  endereco_principal TEXT,
  endereco_label VARCHAR(80),
  latitude DOUBLE,
  longitude DOUBLE,
  senha_hash TEXT,
  total_pedidos INT DEFAULT 0,
  deletado_em DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_clientes_email (email),
  KEY idx_clientes_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cardapio (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  restaurante_id VARCHAR(191) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DOUBLE NOT NULL,
  preco_original DOUBLE,
  categoria VARCHAR(120),
  subcategoria VARCHAR(120),
  imagem TEXT,
  ingredientes TEXT,
  serve_pessoas INT DEFAULT 1,
  promocao_ativa TINYINT(1) DEFAULT 0,
  promocao_tipo VARCHAR(50),
  promocao_label VARCHAR(120),
  combo_itens LONGTEXT,
  disponivel TINYINT(1) DEFAULT 1,
  destaque TINYINT(1) DEFAULT 0,
  tempo_preparo INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_cardapio_restaurante (restaurante_id),
  KEY idx_cardapio_categoria (categoria),
  CONSTRAINT fk_cardapio_restaurante FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  cliente_id VARCHAR(191),
  restaurante_id VARCHAR(191) NOT NULL,
  entregador_id VARCHAR(191),
  status VARCHAR(50) NOT NULL,
  itens LONGTEXT NOT NULL,
  subtotal DOUBLE NOT NULL,
  taxa_entrega DOUBLE NOT NULL,
  desconto DOUBLE DEFAULT 0,
  troco DOUBLE DEFAULT 0,
  total DOUBLE NOT NULL,
  forma_pagamento VARCHAR(80) NOT NULL,
  pagamento_status VARCHAR(50) DEFAULT 'pendente',
  pagamento_id VARCHAR(191),
  endereco_entrega TEXT NOT NULL,
  latitude_entrega DOUBLE,
  longitude_entrega DOUBLE,
  distancia_km DOUBLE,
  observacoes TEXT,
  tempo_preparo_estimado INT,
  tempo_entrega_estimado INT,
  tempo_total_estimado INT,
  iniciado_em DATETIME,
  confirmado_em DATETIME,
  pronto_em DATETIME,
  coletado_em DATETIME,
  entregue_em DATETIME,
  cancelado_em DATETIME,
  motivo_cancelamento TEXT,
  avaliacao_restaurante INT,
  avaliacao_entregador INT,
  comentario TEXT,
  ganho_entregador DOUBLE DEFAULT 0,
  repasse_entregador_status VARCHAR(50) DEFAULT 'pendente',
  repasse_entregador_em DATETIME,
  oferta_entregador_id VARCHAR(191),
  oferta_enviada_em DATETIME,
  oferta_expira_em DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_pedidos_cliente (cliente_id),
  KEY idx_pedidos_restaurante (restaurante_id),
  KEY idx_pedidos_status (status),
  CONSTRAINT fk_pedidos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_restaurante FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS entregadores (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(191) UNIQUE,
  telefone VARCHAR(20),
  cpf VARCHAR(20) UNIQUE,
  veiculo_tipo VARCHAR(50),
  veiculo_placa VARCHAR(10),
  documento_foto TEXT,
  status VARCHAR(50) DEFAULT 'pendente',
  latitude DOUBLE,
  longitude DOUBLE,
  ultima_atualizacao DATETIME,
  avaliacao_media DOUBLE,
  total_entregas INT DEFAULT 0,
  saldo_disponivel DOUBLE DEFAULT 0,
  saldo_total DOUBLE DEFAULT 0,
  senha_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_entregadores_email (email),
  KEY idx_entregadores_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gerentes (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(191) UNIQUE,
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  restaurante_id VARCHAR(191),
  permissoes TEXT,
  status VARCHAR(50) DEFAULT 'ativo',
  senha_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_gerentes_email (email),
  KEY idx_gerentes_restaurante (restaurante_id),
  CONSTRAINT fk_gerentes_restaurante FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operadores (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(191) UNIQUE,
  telefone VARCHAR(20),
  turno VARCHAR(50),
  status VARCHAR(50) DEFAULT 'ativo',
  senha_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_operadores_email (email),
  KEY idx_operadores_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enderecos_clientes (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  cliente_id VARCHAR(191) NOT NULL,
  label VARCHAR(80) NOT NULL,
  endereco TEXT NOT NULL,
  principal TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_enderecos_cliente (cliente_id),
  CONSTRAINT fk_enderecos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  cliente_id VARCHAR(191),
  solicitante_id VARCHAR(191),
  solicitante_tipo VARCHAR(50),
  solicitante_nome VARCHAR(255),
  solicitante_email VARCHAR(255),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(120) NOT NULL,
  pedido_id VARCHAR(191),
  status VARCHAR(50) DEFAULT 'aberto',
  prioridade VARCHAR(50) DEFAULT 'normal',
  resposta TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_tickets_cliente (cliente_id),
  KEY idx_tickets_solicitante (solicitante_id),
  KEY idx_tickets_pedido (pedido_id),
  KEY idx_tickets_status (status),
  CONSTRAINT fk_tickets_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cupons (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  desconto DOUBLE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  minimo DOUBLE DEFAULT 0,
  data_expiracao DATETIME,
  ativo TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cupons_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cupom_usos (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  cupom_codigo VARCHAR(100) NOT NULL,
  cliente_id VARCHAR(191) NOT NULL,
  pedido_id VARCHAR(191) NOT NULL,
  usado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cupom_usos_cliente_codigo (cliente_id, cupom_codigo),
  KEY idx_cupom_usos_codigo (cupom_codigo),
  KEY idx_cupom_usos_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
