-- database/schema.sql

-- Tabela de restaurantes
CREATE TABLE restaurantes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    endereco TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    categoria TEXT NOT NULL,
    descricao TEXT,
    logo TEXT,
    capa TEXT,
    status TEXT DEFAULT 'pendente',
    taxa_comissao REAL DEFAULT 15,
    tempo_medio_preparo INTEGER,
    avaliacao_media REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de gerentes (A001)
CREATE TABLE gerentes (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    cargo TEXT,
    restaurante_id TEXT,
    permissoes TEXT,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);

-- Tabela de operadores (A002)
CREATE TABLE operadores (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    turno TEXT,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de entregadores (A004)
CREATE TABLE entregadores (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    veiculo_tipo TEXT NOT NULL,
    veiculo_placa TEXT,
    documento_foto TEXT,
    status TEXT DEFAULT 'disponivel',
    latitude REAL,
    longitude REAL,
    ultima_atualizacao DATETIME,
    avaliacao_media REAL DEFAULT 0,
    total_entregas INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes (A005)
CREATE TABLE clientes (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    data_nascimento DATE,
    endereco_principal TEXT,
    latitude REAL,
    longitude REAL,
    total_pedidos INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cardápio
CREATE TABLE cardapio (
    id TEXT PRIMARY KEY,
    restaurante_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    categoria TEXT NOT NULL,
    subcategoria TEXT,
    imagem TEXT,
    ingredientes TEXT,
    disponivel BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    tempo_preparo INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);

-- Tabela de pedidos
CREATE TABLE pedidos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    restaurante_id TEXT NOT NULL,
    entregador_id TEXT,
    status TEXT NOT NULL,
    itens TEXT NOT NULL,
    subtotal REAL NOT NULL,
    taxa_entrega REAL NOT NULL,
    desconto REAL DEFAULT 0,
    total REAL NOT NULL,
    forma_pagamento TEXT NOT NULL,
    pagamento_status TEXT DEFAULT 'pendente',
    pagamento_id TEXT,
    endereco_entrega TEXT NOT NULL,
    latitude_entrega REAL,
    longitude_entrega REAL,
    distancia_km REAL,
    observacoes TEXT,
    tempo_preparo_estimado INTEGER,
    tempo_entrega_estimado INTEGER,
    tempo_total_estimado INTEGER,
    iniciado_em DATETIME,
    confirmado_em DATETIME,
    pronto_em DATETIME,
    entregue_em DATETIME,
    cancelado_em DATETIME,
    motivo_cancelamento TEXT,
    avaliacao_restaurante INTEGER,
    avaliacao_entregador INTEGER,
    comentario TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-- Tabela de rotas/rastreamento
CREATE TABLE rotas (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL,
    entregador_id TEXT NOT NULL,
    origem_lat REAL NOT NULL,
    origem_lng REAL NOT NULL,
    destino_lat REAL NOT NULL,
    destino_lng REAL NOT NULL,
    distancia_km REAL,
    duracao_estimada INTEGER,
    pontos_rota TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-- Tabela de disputas (UC014)
CREATE TABLE disputas (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL,
    criador_id TEXT NOT NULL,
    tipo_reclamante TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    evidencias TEXT,
    status TEXT DEFAULT 'aberta',
    resposta_outra_parte TEXT,
    resolucao TEXT,
    resultado BOOLEAN,
    motivo_resolucao TEXT,
    operador_responsavel_id TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    respondido_em DATETIME,
    resolvido_em DATETIME,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (operador_responsavel_id) REFERENCES operadores(id)
);

-- Tabela de tickets (suporte)
CREATE TABLE tickets (
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
);

-- Tabela de relatórios gerenciais
CREATE TABLE relatorios_cache (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    periodo TEXT NOT NULL,
    dados TEXT NOT NULL,
    data_referencia DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_restaurantes_status ON restaurantes(status);
CREATE INDEX idx_entregadores_status ON entregadores(status);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_restaurante ON pedidos(restaurante_id);
CREATE INDEX idx_pedidos_entregador ON pedidos(entregador_id);
CREATE INDEX idx_pedidos_created ON pedidos(created_at);
CREATE INDEX idx_disputas_status ON disputas(status);
CREATE INDEX idx_disputas_pedido ON disputas(pedido_id);
CREATE INDEX idx_disputas_criador ON disputas(criador_id);