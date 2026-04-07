// aqui é o back gelado - estes dados de lojas são exemplos para o frontend.
// Substituir por uma API de lojas quando o backend estiver disponível.
export const lojas = [
  {
    id: 1, nome: 'Pizza Hut', categoria: 'Pizza', avaliacao: 4.5,
    tempoEntrega: '30-40 min', taxaEntrega: 'Grátis', pedidoMinimo: 'R$ 21,00',
    emoji: '🍕', distancia: '1.2 km', superRestaurante: true, tipo: 'restaurante',
    sobre: 'Pizzas artesanais feitas com ingredientes frescos e de alta qualidade. Nossa missão é trazer uma experiência gastronômica inigualável para cada pedido.',
    endereco: 'Av. Pontes Vieira, 726 - Tauape, Fortaleza - CE',
    horarios: [
      { dia: 'Segunda a Sexta', horario: '18:00 - 23:00' },
      { dia: 'Sábado e Domingo', horario: '17:00 - 00:00' },
    ],
    pagamentos: ['Dinheiro', 'Crédito', 'Débito', 'Pix'],
    categorias: [
      { id: 'destaques', nome: 'Destaques', produtos: [
        { id: 101, nome: 'Pizza G + Borda + Refri 1L', desc: 'Pizza grande com borda recheada e refri 1L da sua escolha.', serve: 4, preco: 47.98, precoAnterior: 89.99, emoji: '🍕',
          opcionais: [{ titulo: 'Escolha sua borda', obrigatorio: true, max: 1, opcoes: [{ id: 'b1', nome: 'Borda Requeijão', preco: 0 }, { id: 'b2', nome: 'Borda Catupiry', preco: 0 }, { id: 'b3', nome: 'Borda Cheddar', preco: 3.00 }] }] },
        { id: 102, nome: 'Pizza Grande + Borda Grátis', desc: 'Pizza grande com borda grátis, sabor à sua escolha.', serve: 4, preco: 24.98, precoAnterior: 69.99, emoji: '🍕',
          opcionais: [{ titulo: 'Escolha sua borda', obrigatorio: true, max: 1, opcoes: [{ id: 'b1', nome: 'Borda Requeijão', preco: 0 }, { id: 'b2', nome: 'Borda Catupiry', preco: 0 }] }] },
        { id: 103, nome: 'Pizza G + Borda + Coca-Cola 1L', desc: 'Pizza grande com borda e Coca-Cola 1L gelada.', serve: 4, preco: 32.98, precoAnterior: 69.99, emoji: '🥤', opcionais: [] },
      ]},
      { id: 'promocoes', nome: 'Promoções', produtos: [
        { id: 201, nome: 'Pizza Grande + Borda Grátis', desc: 'Pizza G com borda recheada grátis. Escolha o sabor que quiser.', serve: 4, preco: 24.98, precoAnterior: 69.99, emoji: '🍕', opcionais: [] },
        { id: 202, nome: 'Pizza G + Borda + Coca-Cola 1L', desc: 'Pizza grande com borda e Coca-Cola gelada.', serve: 4, preco: 32.98, precoAnterior: 69.99, emoji: '🥤', opcionais: [] },
        { id: 204, nome: 'Pizza 4 Pedaços - Mussarela', desc: 'Pizza pequena (25cm) de mussarela, perfeita pra uma pessoa.', serve: 1, preco: 27.98, precoAnterior: null, emoji: '🧀', opcionais: [] },
      ]},
      { id: 'tradicionais', nome: 'Pizzas Tradicionais', produtos: [
        { id: 301, nome: 'Pizza Margherita', desc: 'Molho de tomate, mussarela e manjericão fresco.', serve: 2, preco: 39.90, precoAnterior: null, emoji: '🍕', opcionais: [] },
        { id: 302, nome: 'Pizza Portuguesa', desc: 'Presunto, ovos, cebola, azeitona e mussarela.', serve: 3, preco: 44.90, precoAnterior: null, emoji: '🍕', opcionais: [] },
        { id: 303, nome: 'Pizza Frango c/ Catupiry', desc: 'Frango desfiado com catupiry cremoso.', serve: 3, preco: 46.90, precoAnterior: null, emoji: '🍗', opcionais: [] },
        { id: 304, nome: 'Pizza Calabresa', desc: 'Calabresa fatiada, cebola e mussarela.', serve: 3, preco: 42.90, precoAnterior: null, emoji: '🍕', opcionais: [] },
        { id: 305, nome: 'Pizza Quatro Queijos', desc: 'Mussarela, provolone, parmesão e gorgonzola.', serve: 3, preco: 48.90, precoAnterior: null, emoji: '🧀', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas', produtos: [
        { id: 401, nome: 'Coca-Cola 2L', desc: 'Refrigerante gelado.', serve: null, preco: 12.00, precoAnterior: null, emoji: '🥤', opcionais: [] },
        { id: 402, nome: 'Suco de Laranja 500ml', desc: 'Natural espremido na hora.', serve: null, preco: 9.90, precoAnterior: null, emoji: '🍊', opcionais: [] },
        { id: 403, nome: 'Água Mineral 500ml', desc: 'Água sem gás gelada.', serve: null, preco: 4.00, precoAnterior: null, emoji: '💧', opcionais: [] },
      ]},
    ],
  },

  {
    id: 2, nome: "McDonald's", categoria: 'Lanches', avaliacao: 4.2,
    tempoEntrega: '20-30 min', taxaEntrega: 'R$ 3,00', pedidoMinimo: 'R$ 15,00',
    emoji: '🍔', distancia: '0.8 km', superRestaurante: false, tipo: 'restaurante',
    sobre: 'A maior rede de lanches rápidos do mundo, com os melhores clássicos entregues até você.',
    endereco: 'Av. Beira Mar, 100 - Meireles, Fortaleza - CE',
    horarios: [{ dia: 'Todos os dias', horario: '24 horas' }],
    pagamentos: ['Dinheiro', 'Crédito', 'Débito', 'Pix'],
    categorias: [
      { id: 'destaques', nome: 'Destaques', produtos: [
        { id: 505, nome: 'Combo Big Mac', desc: 'Big Mac + batata média + refrigerante médio à escolha.', serve: 1, preco: 42.90, precoAnterior: 49.90, emoji: '🍔',
          opcionais: [{ titulo: 'Escolha o refrigerante', obrigatorio: true, max: 1, opcoes: [{ id: 'r1', nome: 'Coca-Cola', preco: 0 }, { id: 'r2', nome: 'Sprite', preco: 0 }, { id: 'r3', nome: 'Fanta Laranja', preco: 0 }] }] },
        { id: 506, nome: 'Combo McChicken', desc: 'McChicken + batata média + refrigerante médio.', serve: 1, preco: 38.90, precoAnterior: 45.90, emoji: '🍗', opcionais: [] },
        { id: 507, nome: 'Oferta 2 Sanduíches', desc: '2 sanduíches à escolha por um preço especial.', serve: 2, preco: 34.90, precoAnterior: 49.80, emoji: '🍔', opcionais: [] },
      ]},
      { id: 'lanches', nome: 'Lanches', produtos: [
        { id: 501, nome: 'Big Mac', desc: 'Dois hambúrgueres, alface, queijo, molho especial, cebola e picles.', serve: 1, preco: 26.90, precoAnterior: null, emoji: '🍔', opcionais: [] },
        { id: 502, nome: 'McChicken', desc: 'Frango empanado crocante, maionese e alface.', serve: 1, preco: 21.90, precoAnterior: null, emoji: '🍗', opcionais: [] },
        { id: 503, nome: 'Quarterão com Queijo', desc: 'Hambúrguer 114g, queijo, cebola, picles, ketchup e mostarda.', serve: 1, preco: 24.90, precoAnterior: null, emoji: '🍔', opcionais: [] },
        { id: 504, nome: 'McFiesta', desc: 'Hambúrguer, queijo, alface, tomate e maionese.', serve: 1, preco: 22.90, precoAnterior: null, emoji: '🍔', opcionais: [] },
      ]},
      { id: 'sobremesas', nome: 'Sobremesas', produtos: [
        { id: 508, nome: 'McFlurry Oreo', desc: 'Sorvete cremoso com pedaços de Oreo.', serve: 1, preco: 14.90, precoAnterior: null, emoji: '🍦', opcionais: [] },
        { id: 509, nome: 'Torta de Maçã', desc: 'Massa crocante recheada com maçã canelada.', serve: 1, preco: 8.90, precoAnterior: null, emoji: '🥧', opcionais: [] },
        { id: 510, nome: 'Casquinha de Sorvete', desc: 'Sorvete de baunilha na casquinha crocante.', serve: 1, preco: 5.00, precoAnterior: null, emoji: '🍦', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas', produtos: [
        { id: 511, nome: 'Refrigerante Médio', desc: 'Coca-Cola, Sprite ou Fanta Laranja 400ml.', serve: null, preco: 9.00, precoAnterior: null, emoji: '🥤', opcionais: [] },
        { id: 512, nome: 'Suco de Laranja', desc: 'Natural espremido na hora 300ml.', serve: null, preco: 10.00, precoAnterior: null, emoji: '🍊', opcionais: [] },
      ]},
    ],
  },

  {
    id: 3, nome: 'Sabor da Terra', categoria: 'Brasileira', avaliacao: 4.8,
    tempoEntrega: '35-45 min', taxaEntrega: 'R$ 6,00', pedidoMinimo: 'R$ 25,00',
    emoji: '🥘', distancia: '2.1 km', superRestaurante: false, tipo: 'restaurante',
    sobre: 'Comida caseira com o sabor da culinária brasileira tradicional. Feito com carinho, como na casa da sua avó.',
    endereco: 'Rua das Flores, 200 - Centro, Fortaleza - CE',
    horarios: [{ dia: 'Segunda a Sexta', horario: '11:00 - 15:00' }, { dia: 'Sábado', horario: '11:00 - 16:00' }],
    pagamentos: ['Dinheiro', 'Pix'],
    categorias: [
      { id: 'destaques', nome: 'Destaques', produtos: [
        { id: 601, nome: 'Prato Feito Completo', desc: 'Arroz, feijão, bife acebolado, ovo frito e salada.', serve: 1, preco: 24.90, precoAnterior: 29.90, emoji: '🍱', opcionais: [] },
        { id: 602, nome: 'Galinha Caipira com Arroz', desc: 'Galinha caipira cozida no tempero da roça com arroz branco e pirão.', serve: 2, preco: 42.90, precoAnterior: null, emoji: '🍗', opcionais: [] },
      ]},
      { id: 'pratos', nome: 'Pratos Principais', produtos: [
        { id: 603, nome: 'Bife Acebolado', desc: 'Bife de carne bovina com cebola caramelada, arroz e feijão.', serve: 1, preco: 27.90, precoAnterior: null, emoji: '🥩', opcionais: [] },
        { id: 604, nome: 'Frango Grelhado', desc: 'Filé de frango grelhado com ervas, arroz, feijão e salada.', serve: 1, preco: 25.90, precoAnterior: null, emoji: '🍗', opcionais: [] },
        { id: 605, nome: 'Feijão Tropeiro', desc: 'Feijão com linguiça, bacon, ovo, farinha e couve. Acompanha arroz.', serve: 2, preco: 38.90, precoAnterior: null, emoji: '🫘', opcionais: [] },
        { id: 606, nome: 'Escondidinho de Carne Seca', desc: 'Camadas de purê de mandioca com carne seca desfiada e queijo gratinado.', serve: 2, preco: 44.90, precoAnterior: null, emoji: '🥘', opcionais: [] },
      ]},
      { id: 'caldos', nome: 'Sopas e Caldos', produtos: [
        { id: 607, nome: 'Caldo de Feijão', desc: 'Caldo cremoso de feijão com linguiça e torresmo.', serve: 1, preco: 15.90, precoAnterior: null, emoji: '🫕', opcionais: [] },
        { id: 608, nome: 'Sopa de Legumes', desc: 'Caldo de legumes frescos com frango desfiado e macarrão.', serve: 1, preco: 18.90, precoAnterior: null, emoji: '🥣', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas', produtos: [
        { id: 609, nome: 'Suco de Caju 400ml', desc: 'Natural gelado.', serve: null, preco: 8.00, precoAnterior: null, emoji: '🥤', opcionais: [] },
        { id: 610, nome: 'Limonada Suíça 500ml', desc: 'Limonada cremosa gelada.', serve: null, preco: 10.00, precoAnterior: null, emoji: '🍋', opcionais: [] },
        { id: 611, nome: 'Água Mineral 500ml', desc: 'Garrafa sem gás.', serve: null, preco: 4.00, precoAnterior: null, emoji: '💧', opcionais: [] },
      ]},
    ],
  },

  {
    id: 4, nome: 'Sushi Express', categoria: 'Japonesa', avaliacao: 4.7,
    tempoEntrega: '40-50 min', taxaEntrega: 'Grátis', pedidoMinimo: 'R$ 30,00',
    emoji: '🍱', distancia: '3.0 km', superRestaurante: true, promo: 'Novo', tipo: 'restaurante',
    sobre: 'Sushi artesanal preparado com ingredientes frescos e importados. A autenticidade da culinária japonesa entregue na sua porta.',
    endereco: 'Rua do Japão, 50 - Aldeota, Fortaleza - CE',
    horarios: [{ dia: 'Terça a Domingo', horario: '18:00 - 23:00' }],
    pagamentos: ['Crédito', 'Pix'],
    categorias: [
      { id: 'destaques', nome: 'Destaques', produtos: [
        { id: 701, nome: 'Combo Sushi 20 Peças', desc: 'Mix de 20 peças combinando niguiris, uramakis e temakis.', serve: 2, preco: 79.90, precoAnterior: 99.90, emoji: '🍱', opcionais: [] },
        { id: 702, nome: 'Combo Família 40 Peças', desc: '40 peças variadas, ideal para compartilhar.', serve: 4, preco: 149.90, precoAnterior: 189.90, emoji: '🍣', opcionais: [] },
      ]},
      { id: 'niguiris', nome: 'Niguiris', produtos: [
        { id: 703, nome: 'Niguiri Salmão (4 un)', desc: 'Bolinho de arroz japonês coberto com salmão fresco.', serve: 1, preco: 22.90, precoAnterior: null, emoji: '🍣', opcionais: [] },
        { id: 704, nome: 'Niguiri Atum (4 un)', desc: 'Bolinho de arroz japonês coberto com atum fresco.', serve: 1, preco: 24.90, precoAnterior: null, emoji: '🍣', opcionais: [] },
        { id: 705, nome: 'Niguiri Camarão (4 un)', desc: 'Bolinho de arroz coberto com camarão cozido.', serve: 1, preco: 26.90, precoAnterior: null, emoji: '🦐', opcionais: [] },
      ]},
      { id: 'uramakis', nome: 'Uramakis', produtos: [
        { id: 706, nome: 'Uramaki Filadélfia (8 un)', desc: 'Cream cheese, salmão e pepino com gergelim.', serve: 1, preco: 28.90, precoAnterior: null, emoji: '🍱', opcionais: [] },
        { id: 707, nome: 'Uramaki Camarão Empanado (8 un)', desc: 'Camarão empanado em tempura com cream cheese e cebolinha.', serve: 1, preco: 32.90, precoAnterior: null, emoji: '🍱', opcionais: [] },
        { id: 708, nome: 'Uramaki Tropical (8 un)', desc: 'Salmão, manga e cream cheese com gergelim preto.', serve: 1, preco: 30.90, precoAnterior: null, emoji: '🥭', opcionais: [] },
      ]},
      { id: 'temakis', nome: 'Temakis', produtos: [
        { id: 709, nome: 'Temaki Salmão', desc: 'Cone de alga recheado com arroz, salmão e cream cheese.', serve: 1, preco: 24.90, precoAnterior: null, emoji: '🌮', opcionais: [] },
        { id: 710, nome: 'Temaki Camarão', desc: 'Cone de alga com arroz, camarão e maionese japonesa.', serve: 1, preco: 27.90, precoAnterior: null, emoji: '🦐', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas', produtos: [
        { id: 711, nome: 'Chá Verde Gelado 300ml', desc: 'Chá verde japonês gelado levemente adoçado.', serve: null, preco: 9.00, precoAnterior: null, emoji: '🍵', opcionais: [] },
        { id: 712, nome: 'Refrigerante Lata 350ml', desc: 'Coca-Cola, Sprite ou Guaraná.', serve: null, preco: 7.00, precoAnterior: null, emoji: '🥤', opcionais: [] },
      ]},
    ],
  },

  {
    id: 5, nome: 'Açaí do Norte', categoria: 'Açaí', avaliacao: 4.6,
    tempoEntrega: '20-30 min', taxaEntrega: 'R$ 2,00', pedidoMinimo: 'R$ 20,00',
    emoji: '🫐', distancia: '1.5 km', superRestaurante: false, tipo: 'restaurante',
    sobre: 'O melhor açaí do nordeste, direto do Pará, com toppings premium e combinações irresistíveis.',
    endereco: 'Av. Abolição, 300 - Meireles, Fortaleza - CE',
    horarios: [{ dia: 'Todos os dias', horario: '10:00 - 22:00' }],
    pagamentos: ['Dinheiro', 'Pix', 'Débito'],
    categorias: [
      { id: 'acai', nome: 'Açaí', produtos: [
        { id: 801, nome: 'Açaí 300ml', desc: 'Açaí puro batido na hora. Cremoso e fresquinho.', serve: 1, preco: 16.90, precoAnterior: null, emoji: '🫐',
          opcionais: [{ titulo: 'Acompanhamentos (até 3)', obrigatorio: false, max: 3, opcoes: [{ id: 'a1', nome: 'Granola', preco: 0 }, { id: 'a2', nome: 'Banana', preco: 0 }, { id: 'a3', nome: 'Morango', preco: 0 }, { id: 'a4', nome: 'Leite Ninho', preco: 1.50 }, { id: 'a5', nome: 'Nutella', preco: 2.00 }] }] },
        { id: 802, nome: 'Açaí 500ml', desc: 'Porção média de açaí cremoso batido na hora.', serve: 1, preco: 24.90, precoAnterior: null, emoji: '🫐',
          opcionais: [{ titulo: 'Acompanhamentos (até 3)', obrigatorio: false, max: 3, opcoes: [{ id: 'a1', nome: 'Granola', preco: 0 }, { id: 'a2', nome: 'Banana', preco: 0 }, { id: 'a3', nome: 'Morango', preco: 0 }, { id: 'a4', nome: 'Leite Ninho', preco: 1.50 }, { id: 'a5', nome: 'Nutella', preco: 2.00 }] }] },
        { id: 803, nome: 'Açaí 1L', desc: 'Porção família de açaí puro, perfeita para compartilhar.', serve: 3, preco: 44.90, precoAnterior: 52.90, emoji: '🫐', opcionais: [] },
      ]},
      { id: 'combos', nome: 'Combos', produtos: [
        { id: 804, nome: 'Combo Casal 2x500ml', desc: 'Dois copos de 500ml de açaí com toppings à escolha.', serve: 2, preco: 42.90, precoAnterior: 49.80, emoji: '💜', opcionais: [] },
        { id: 805, nome: 'Tigela de Açaí', desc: 'Açaí em tigela com granola, banana, morango e mel.', serve: 1, preco: 29.90, precoAnterior: null, emoji: '🥣', opcionais: [] },
      ]},
      { id: 'vitaminas', nome: 'Vitaminas', produtos: [
        { id: 806, nome: 'Vitamina de Banana', desc: 'Vitamina cremosa de banana com leite e mel.', serve: 1, preco: 13.90, precoAnterior: null, emoji: '🍌', opcionais: [] },
        { id: 807, nome: 'Vitamina de Morango', desc: 'Vitamina refrescante de morango com leite gelado.', serve: 1, preco: 14.90, precoAnterior: null, emoji: '🍓', opcionais: [] },
      ]},
    ],
  },

  {
    id: 6, nome: 'Churrascaria Sul', categoria: 'Churrasco', avaliacao: 4.9,
    tempoEntrega: '45-55 min', taxaEntrega: 'R$ 8,00', pedidoMinimo: 'R$ 40,00',
    emoji: '🥩', distancia: '4.2 km', superRestaurante: true, tipo: 'restaurante',
    sobre: 'A melhor carne gaúcha em Fortaleza. Cortes nobres grelhados na hora com o tempero tradicional do sul.',
    endereco: 'Rua Gaúcha, 42 - Cocó, Fortaleza - CE',
    horarios: [{ dia: 'Quinta a Domingo', horario: '18:00 - 23:30' }],
    pagamentos: ['Dinheiro', 'Crédito', 'Débito'],
    categorias: [
      { id: 'destaques', nome: 'Destaques', produtos: [
        { id: 901, nome: 'Picanha Grelhada 300g', desc: 'Picanha premium grelhada na brasa com farofa e vinagrete.', serve: 1, preco: 89.90, precoAnterior: 109.90, emoji: '🥩', opcionais: [] },
        { id: 902, nome: 'Combo Churrasco Família', desc: 'Picanha 500g + frango + linguiça + acompanhamentos. Para até 4 pessoas.', serve: 4, preco: 189.90, precoAnterior: 239.90, emoji: '🍖', opcionais: [] },
      ]},
      { id: 'carnes', nome: 'Carnes', produtos: [
        { id: 903, nome: 'Costela Bovina 400g', desc: 'Costela bovina assada lentamente na brasa, desfiando na faca.', serve: 2, preco: 79.90, precoAnterior: null, emoji: '🍖', opcionais: [] },
        { id: 904, nome: 'Fraldinha Grelhada 250g', desc: 'Fraldinha macia e suculenta grelhada com chimichurri.', serve: 1, preco: 67.90, precoAnterior: null, emoji: '🥩', opcionais: [] },
        { id: 905, nome: 'Ancho Grelhado 300g', desc: 'Corte nobre grelhado ao ponto perfeito.', serve: 1, preco: 94.90, precoAnterior: null, emoji: '🥩', opcionais: [] },
      ]},
      { id: 'acompanhamentos', nome: 'Acompanhamentos', produtos: [
        { id: 906, nome: 'Farofa Especial', desc: 'Farofa de manteiga com bacon e cebola caramelada.', serve: 2, preco: 18.90, precoAnterior: null, emoji: '🫙', opcionais: [] },
        { id: 907, nome: 'Arroz e Feijão', desc: 'Arroz branco soltinho e feijão temperado.', serve: 2, preco: 16.90, precoAnterior: null, emoji: '🍚', opcionais: [] },
        { id: 908, nome: 'Pão de Alho Grelhado (6 un)', desc: 'Pão de alho na brasa com manteiga e alho.', serve: 2, preco: 14.90, precoAnterior: null, emoji: '🧄', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas', produtos: [
        { id: 909, nome: 'Cerveja Artesanal 500ml', desc: 'Cerveja artesanal gelada.', serve: null, preco: 18.90, precoAnterior: null, emoji: '🍺', opcionais: [] },
        { id: 910, nome: 'Refrigerante Lata 350ml', desc: 'Coca-Cola, Guaraná ou Sprite.', serve: null, preco: 7.00, precoAnterior: null, emoji: '🥤', opcionais: [] },
        { id: 911, nome: 'Água Mineral 500ml', desc: 'Água gelada sem gás.', serve: null, preco: 4.00, precoAnterior: null, emoji: '💧', opcionais: [] },
      ]},
    ],
  },

  // ── MERCADOS ──────────────────────────────────────────────────────────────
  {
    id: 7, nome: 'Mercadinho Fortaleza', categoria: 'Mercado', avaliacao: 4.3,
    tempoEntrega: '25-35 min', taxaEntrega: 'R$ 4,00', pedidoMinimo: 'R$ 30,00',
    emoji: '🛒', distancia: '0.6 km', superRestaurante: false, tipo: 'mercado',
    sobre: 'O mercadinho do bairro com tudo que você precisa. Frutas, verduras, laticínios e muito mais.',
    endereco: 'Rua Tibúrcio Cavalcante, 1200 - Aldeota, Fortaleza - CE',
    horarios: [{ dia: 'Segunda a Sábado', horario: '07:00 - 21:00' }, { dia: 'Domingo', horario: '08:00 - 18:00' }],
    pagamentos: ['Dinheiro', 'Pix', 'Débito', 'Crédito'],
    categorias: [
      { id: 'hortifruti', nome: 'Hortifruti', produtos: [
        { id: 1001, nome: 'Banana Prata (kg)', desc: 'Banana prata madura, doce e cremosa.', serve: null, preco: 5.90, precoAnterior: null, emoji: '🍌', opcionais: [] },
        { id: 1002, nome: 'Tomate (kg)', desc: 'Tomate vermelho selecionado, firme e saboroso.', serve: null, preco: 6.90, precoAnterior: null, emoji: '🍅', opcionais: [] },
        { id: 1003, nome: 'Alface Americana (pé)', desc: 'Alface americana fresca.', serve: null, preco: 3.50, precoAnterior: null, emoji: '🥬', opcionais: [] },
        { id: 1004, nome: 'Mamão Formosa (un)', desc: 'Mamão formosa maduro e doce.', serve: null, preco: 8.90, precoAnterior: null, emoji: '🍈', opcionais: [] },
      ]},
      { id: 'laticinios', nome: 'Laticínios', produtos: [
        { id: 1005, nome: 'Leite Integral 1L', desc: 'Leite integral UHT longa vida.', serve: null, preco: 6.49, precoAnterior: null, emoji: '🥛', opcionais: [] },
        { id: 1006, nome: 'Queijo Mussarela (kg)', desc: 'Queijo mussarela fatiado na hora.', serve: null, preco: 39.90, precoAnterior: null, emoji: '🧀', opcionais: [] },
        { id: 1007, nome: 'Iogurte Natural 170g', desc: 'Iogurte natural integral sem açúcar.', serve: null, preco: 3.99, precoAnterior: null, emoji: '🥛', opcionais: [] },
        { id: 1008, nome: 'Manteiga com Sal 200g', desc: 'Manteiga de primeira qualidade.', serve: null, preco: 12.90, precoAnterior: null, emoji: '🧈', opcionais: [] },
      ]},
      { id: 'padaria', nome: 'Padaria', produtos: [
        { id: 1009, nome: 'Pão Francês (6 un)', desc: 'Pão francês fresquinho saído do forno.', serve: null, preco: 4.50, precoAnterior: null, emoji: '🥖', opcionais: [] },
        { id: 1010, nome: 'Bolo de Cenoura (fatia)', desc: 'Fatia grande de bolo de cenoura com cobertura de chocolate.', serve: 1, preco: 8.90, precoAnterior: null, emoji: '🍰', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas', produtos: [
        { id: 1011, nome: 'Coca-Cola 2L', desc: 'Refrigerante gelado.', serve: null, preco: 11.90, precoAnterior: null, emoji: '🥤', opcionais: [] },
        { id: 1012, nome: 'Água Mineral 1,5L', desc: 'Água sem gás gelada.', serve: null, preco: 3.50, precoAnterior: null, emoji: '💧', opcionais: [] },
        { id: 1013, nome: 'Suco de Caixinha 1L', desc: 'Suco sabores variados.', serve: null, preco: 8.90, precoAnterior: null, emoji: '🧃', opcionais: [] },
      ]},
    ],
  },

  {
    id: 8, nome: 'Conveniência 24h', categoria: 'Conveniência', avaliacao: 4.1,
    tempoEntrega: '15-25 min', taxaEntrega: 'R$ 3,00', pedidoMinimo: 'R$ 15,00',
    emoji: '🏪', distancia: '0.3 km', superRestaurante: false, tipo: 'mercado',
    sobre: 'Aberto 24 horas por dia, 7 dias por semana. Tudo o que você precisa a qualquer hora do dia ou da noite.',
    endereco: 'Av. Dom Luís, 500 - Meireles, Fortaleza - CE',
    horarios: [{ dia: 'Todos os dias', horario: '24 horas' }],
    pagamentos: ['Dinheiro', 'Pix', 'Débito', 'Crédito'],
    categorias: [
      { id: 'snacks', nome: 'Salgadinhos e Biscoitos', produtos: [
        { id: 1101, nome: 'Batata Lays Original (96g)', desc: 'Batata frita crocante sabor original.', serve: null, preco: 7.90, precoAnterior: null, emoji: '🥔', opcionais: [] },
        { id: 1102, nome: 'Cheetos Requeijão (45g)', desc: 'Salgadinho de milho sabor requeijão.', serve: null, preco: 4.90, precoAnterior: null, emoji: '🟠', opcionais: [] },
        { id: 1103, nome: 'Biscoito Recheado (126g)', desc: 'Biscoito recheado de chocolate ou morango.', serve: null, preco: 5.50, precoAnterior: null, emoji: '🍪', opcionais: [] },
      ]},
      { id: 'bebidas', nome: 'Bebidas e Energéticos', produtos: [
        { id: 1104, nome: 'Energético Lata 250ml', desc: 'Energético gelado sabor original.', serve: null, preco: 12.90, precoAnterior: null, emoji: '⚡', opcionais: [] },
        { id: 1105, nome: 'Energético Grande 473ml', desc: 'Energético tamanho grande gelado.', serve: null, preco: 14.90, precoAnterior: null, emoji: '🟢', opcionais: [] },
        { id: 1106, nome: 'Água de Coco 330ml', desc: 'Água de coco natural gelada.', serve: null, preco: 6.90, precoAnterior: null, emoji: '🥥', opcionais: [] },
        { id: 1107, nome: 'Cerveja Lata 350ml', desc: 'Cerveja gelada, marcas variadas.', serve: null, preco: 8.90, precoAnterior: null, emoji: '🍺', opcionais: [] },
      ]},
      { id: 'higiene', nome: 'Higiene e Limpeza', produtos: [
        { id: 1108, nome: 'Desodorante Aerossol 150ml', desc: 'Desodorante masculino ou feminino.', serve: null, preco: 14.90, precoAnterior: null, emoji: '🧴', opcionais: [] },
        { id: 1109, nome: 'Sabonete em Barra 90g', desc: 'Sabonete hidratante.', serve: null, preco: 4.50, precoAnterior: null, emoji: '🧼', opcionais: [] },
        { id: 1110, nome: 'Papel Higiênico (4 rolos)', desc: 'Folha dupla macia.', serve: null, preco: 8.90, precoAnterior: null, emoji: '🧻', opcionais: [] },
      ]},
      { id: 'congelados', nome: 'Congelados e Frios', produtos: [
        { id: 1111, nome: 'Picolé (un)', desc: 'Picolé de chocolate ou morango gelado.', serve: null, preco: 4.50, precoAnterior: null, emoji: '🍦', opcionais: [] },
        { id: 1112, nome: 'Mortadela Fatiada 200g', desc: 'Mortadela fatiada a vácuo.', serve: null, preco: 9.90, precoAnterior: null, emoji: '🍖', opcionais: [] },
      ]},
    ],
  },
]

export const todosProdutos = lojas.flatMap(loja =>
  loja.categorias.flatMap(cat =>
    cat.produtos.map(p => ({ ...p, loja }))
  )
)
