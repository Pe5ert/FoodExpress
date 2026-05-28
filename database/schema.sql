-- ============================================================
-- FoodExpress - Schema para MySQL / MariaDB (phpMyAdmin)
-- ============================================================
-- Diferenças aplicadas em relação ao schema SQLite/Turso:
--   • TEXT PRIMARY KEY → VARCHAR(191) PRIMARY KEY (índices em TEXT não são permitidos)
--   • REAL             → DOUBLE
--   • INTEGER          → INT
--   • BOOLEAN          → TINYINT(1)
--   • DEFAULT CURRENT_TIMESTAMP em updated_at usa ON UPDATE
--   • ENGINE=InnoDB + CHARSET=utf8mb4 em todas as tabelas
--   • IF NOT EXISTS nos índices não existe no MySQL; criados via CREATE INDEX normal
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- RESTAURANTES
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurantes (
    id                  VARCHAR(191) NOT NULL,
    user_id             VARCHAR(191),
    nome                VARCHAR(255) NOT NULL,
    cnpj                VARCHAR(20)  NOT NULL,
    email               VARCHAR(255) NOT NULL,
    telefone            VARCHAR(20)  NOT NULL,
    endereco            TEXT         NOT NULL,
    latitude            DOUBLE,
    longitude           DOUBLE,
    categoria           VARCHAR(100) NOT NULL,
    descricao           TEXT,
    logo                TEXT,
    capa                TEXT,
    status              VARCHAR(50)  DEFAULT 'ativo',
    taxa_comissao       DOUBLE       DEFAULT 15,
    tempo_medio_preparo INT,
    horario_abertura    VARCHAR(10),
    horario_fechamento  VARCHAR(10),
    dias_aberto         TEXT,
    formas_pagamento    TEXT,
    motivo_rejeicao     TEXT,
    senha_hash          TEXT,
    avaliacao_media     DOUBLE       DEFAULT 0,
    created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_restaurantes_cnpj (cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- GERENTES (perfil A001)
-- ============================================================
CREATE TABLE IF NOT EXISTS gerentes (
    id              VARCHAR(191) NOT NULL,
    user_id         VARCHAR(191) NOT NULL,
    nome            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    telefone        VARCHAR(20),
    cargo           VARCHAR(100),
    restaurante_id  VARCHAR(191),
    permissoes      TEXT,
    status          VARCHAR(50)  DEFAULT 'ativo',
    senha_hash      TEXT,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_gerentes_user_id (user_id),
    UNIQUE KEY uq_gerentes_email (email),
    CONSTRAINT fk_gerentes_restaurante FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OPERADORES (perfil A002)
-- ============================================================
CREATE TABLE IF NOT EXISTS operadores (
    id          VARCHAR(191) NOT NULL,
    user_id     VARCHAR(191) NOT NULL,
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    telefone    VARCHAR(20),
    turno       VARCHAR(50),
    status      VARCHAR(50)  DEFAULT 'ativo',
    senha_hash  TEXT,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_operadores_user_id (user_id),
    UNIQUE KEY uq_operadores_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ENTREGADORES (perfil A004)
-- ============================================================
CREATE TABLE IF NOT EXISTS entregadores (
    id                  VARCHAR(191) NOT NULL,
    user_id             VARCHAR(191) NOT NULL,
    nome                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    telefone            VARCHAR(20)  NOT NULL,
    cpf                 VARCHAR(20)  NOT NULL,
    veiculo_tipo        VARCHAR(50)  NOT NULL,
    veiculo_placa       VARCHAR(20),
    documento_foto      TEXT,
    status              VARCHAR(50)  DEFAULT 'disponivel',
    latitude            DOUBLE,
    longitude           DOUBLE,
    ultima_atualizacao  DATETIME,
    avaliacao_media     DOUBLE       DEFAULT 0,
    total_entregas      INT          DEFAULT 0,
    saldo_disponivel    DOUBLE       DEFAULT 0,
    saldo_total         DOUBLE       DEFAULT 0,
    senha_hash          TEXT,
    created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_entregadores_user_id (user_id),
    UNIQUE KEY uq_entregadores_email (email),
    UNIQUE KEY uq_entregadores_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CLIENTES (perfil A005)
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id                  VARCHAR(191) NOT NULL,
    user_id             VARCHAR(191) NOT NULL,
    nome                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    telefone            VARCHAR(20),
    data_nascimento     DATE,
    endereco_principal  TEXT,
    latitude            DOUBLE,
    longitude           DOUBLE,
    senha_hash          TEXT,
    total_pedidos       INT          DEFAULT 0,
    deletado_em         DATETIME,
    created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_clientes_user_id (user_id),
    UNIQUE KEY uq_clientes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CARDÁPIO
-- ============================================================
CREATE TABLE IF NOT EXISTS cardapio (
    id              VARCHAR(191) NOT NULL,
    restaurante_id  VARCHAR(191) NOT NULL,
    nome            VARCHAR(255) NOT NULL,
    descricao       TEXT,
    preco           DOUBLE       NOT NULL,
    categoria       VARCHAR(100) NOT NULL,
    subcategoria    VARCHAR(100),
    imagem          TEXT,
    ingredientes    TEXT,
    disponivel      TINYINT(1)   DEFAULT 1,
    destaque        TINYINT(1)   DEFAULT 0,
    tempo_preparo   INT,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_cardapio_restaurante FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PEDIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id                          VARCHAR(191) NOT NULL,
    cliente_id                  VARCHAR(191) NOT NULL,
    restaurante_id              VARCHAR(191) NOT NULL,
    entregador_id               VARCHAR(191),
    status                      VARCHAR(50)  NOT NULL,
    itens                       LONGTEXT     NOT NULL,
    subtotal                    DOUBLE       NOT NULL,
    taxa_entrega                DOUBLE       NOT NULL,
    desconto                    DOUBLE       DEFAULT 0,
    troco                       DOUBLE       DEFAULT 0,
    total                       DOUBLE       NOT NULL,
    forma_pagamento             VARCHAR(50)  NOT NULL,
    pagamento_status            VARCHAR(50)  DEFAULT 'pendente',
    pagamento_id                VARCHAR(191),
    endereco_entrega            TEXT         NOT NULL,
    latitude_entrega            DOUBLE,
    longitude_entrega           DOUBLE,
    distancia_km                DOUBLE,
    observacoes                 TEXT,
    tempo_preparo_estimado      INT,
    tempo_entrega_estimado      INT,
    tempo_total_estimado        INT,
    iniciado_em                 DATETIME,
    confirmado_em               DATETIME,
    pronto_em                   DATETIME,
    entregue_em                 DATETIME,
    cancelado_em                DATETIME,
    motivo_cancelamento         TEXT,
    avaliacao_restaurante       INT,
    avaliacao_entregador        INT,
    comentario                  TEXT,
    ganho_entregador            DOUBLE       DEFAULT 0,
    repasse_entregador_status   VARCHAR(50)  DEFAULT 'pendente',
    repasse_entregador_em       DATETIME,
    created_at                  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pedidos_cliente      FOREIGN KEY (cliente_id)     REFERENCES clientes(id),
    CONSTRAINT fk_pedidos_restaurante  FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    CONSTRAINT fk_pedidos_entregador   FOREIGN KEY (entregador_id)  REFERENCES entregadores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ROTAS / RASTREAMENTO
-- ============================================================
CREATE TABLE IF NOT EXISTS rotas (
    id                  VARCHAR(191) NOT NULL,
    pedido_id           VARCHAR(191) NOT NULL,
    entregador_id       VARCHAR(191) NOT NULL,
    origem_lat          DOUBLE       NOT NULL,
    origem_lng          DOUBLE       NOT NULL,
    destino_lat         DOUBLE       NOT NULL,
    destino_lng         DOUBLE       NOT NULL,
    distancia_km        DOUBLE,
    duracao_estimada    INT,
    pontos_rota         LONGTEXT,
    created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rotas_pedido      FOREIGN KEY (pedido_id)     REFERENCES pedidos(id),
    CONSTRAINT fk_rotas_entregador  FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- AVALIAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
    id              VARCHAR(191) NOT NULL,
    cliente_id      VARCHAR(191) NOT NULL,
    pedido_id       VARCHAR(191),
    restaurante_id  VARCHAR(191),
    entregador_id   VARCHAR(191),
    estrelas        INT          NOT NULL,
    comentario      TEXT,
    tipo            VARCHAR(50)  NOT NULL DEFAULT 'restaurante',
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS cupons (
    id              VARCHAR(191) NOT NULL,
    codigo          VARCHAR(100) NOT NULL,
    desconto        DOUBLE       NOT NULL,
    tipo            VARCHAR(50)  NOT NULL,
    minimo          DOUBLE       DEFAULT 0,
    data_expiracao  DATETIME,
    ativo           TINYINT(1)   DEFAULT 1,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cupons_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DISPUTAS (UC014)
-- ============================================================
CREATE TABLE IF NOT EXISTS disputas (
    id                          VARCHAR(191) NOT NULL,
    pedido_id                   VARCHAR(191) NOT NULL,
    criador_id                  VARCHAR(191) NOT NULL,
    tipo_reclamante             VARCHAR(50)  NOT NULL,
    categoria                   VARCHAR(100) NOT NULL,
    descricao                   TEXT         NOT NULL,
    evidencias                  TEXT,
    status                      VARCHAR(50)  DEFAULT 'aberta',
    resposta_outra_parte        TEXT,
    resolucao                   TEXT,
    resultado                   TINYINT(1),
    motivo_resolucao            TEXT,
    operador_responsavel_id     VARCHAR(191),
    criado_em                   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    respondido_em               DATETIME,
    resolvido_em                DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_disputas_pedido    FOREIGN KEY (pedido_id)                REFERENCES pedidos(id),
    CONSTRAINT fk_disputas_operador  FOREIGN KEY (operador_responsavel_id)  REFERENCES operadores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TICKETS (suporte)
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
    id          VARCHAR(191) NOT NULL,
    cliente_id  VARCHAR(191) NOT NULL,
    titulo      VARCHAR(255) NOT NULL,
    descricao   TEXT         NOT NULL,
    categoria   VARCHAR(100) NOT NULL,
    pedido_id   VARCHAR(191),
    status      VARCHAR(50)  DEFAULT 'aberto',
    prioridade  VARCHAR(50)  DEFAULT 'normal',
    resposta    TEXT,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tickets_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_tickets_pedido  FOREIGN KEY (pedido_id)  REFERENCES pedidos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DENÚNCIAS DE PRODUTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS denuncias_produtos (
    id              VARCHAR(191) NOT NULL,
    produto_id      VARCHAR(191) NOT NULL,
    restaurante_id  VARCHAR(191) NOT NULL,
    cliente_id      VARCHAR(191),
    produto_nome    VARCHAR(255),
    motivo          VARCHAR(255) NOT NULL,
    detalhe         TEXT,
    status          VARCHAR(50)  DEFAULT 'aberta',
    resposta        TEXT,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_denuncias_produto     FOREIGN KEY (produto_id)     REFERENCES cardapio(id),
    CONSTRAINT fk_denuncias_restaurante FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id),
    CONSTRAINT fk_denuncias_cliente     FOREIGN KEY (cliente_id)     REFERENCES clientes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USUÁRIOS PENDENTES (verificação de e-mail / convite)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_pendentes (
    id          VARCHAR(191) NOT NULL,
    email       VARCHAR(255),
    nome        VARCHAR(255),
    telefone    VARCHAR(20),
    token       TEXT         NOT NULL,
    codigo      VARCHAR(20),
    codigo_hash TEXT,
    tipo        VARCHAR(50)  DEFAULT 'email',
    expira_em   DATETIME     NOT NULL,
    usado       TINYINT(1)   DEFAULT 0,
    criado_em   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_pendentes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- RELATÓRIOS (cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios_cache (
    id              VARCHAR(191) NOT NULL,
    tipo            VARCHAR(100) NOT NULL,
    periodo         VARCHAR(100) NOT NULL,
    dados           LONGTEXT     NOT NULL,
    data_referencia DATE         NOT NULL,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_restaurantes_status           ON restaurantes(status);
CREATE INDEX idx_entregadores_status           ON entregadores(status);
CREATE INDEX idx_pedidos_status                ON pedidos(status);
CREATE INDEX idx_pedidos_cliente               ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_restaurante           ON pedidos(restaurante_id);
CREATE INDEX idx_pedidos_entregador            ON pedidos(entregador_id);
CREATE INDEX idx_pedidos_created               ON pedidos(created_at);
CREATE INDEX idx_disputas_status               ON disputas(status);
CREATE INDEX idx_disputas_pedido               ON disputas(pedido_id);
CREATE INDEX idx_disputas_criador              ON disputas(criador_id);
CREATE INDEX idx_denuncias_produtos_restaurante ON denuncias_produtos(restaurante_id);
CREATE INDEX idx_denuncias_produtos_status      ON denuncias_produtos(status);
CREATE INDEX idx_denuncias_produtos_cliente     ON denuncias_produtos(cliente_id);

SET FOREIGN_KEY_CHECKS = 1;