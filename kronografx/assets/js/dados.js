/*
  KRONOGRAFX · DADOS DO SITE
  ==========================
  Tudo que muda com frequência fica aqui: projetos, frames do carrossel,
  perguntas frequentes e contatos. Edite com cuidado (vírgulas e aspas).
*/
window.KRONO = {
  whatsapp: "5516991220381",
  whatsappTexto: "Olá, Kronografx! Vi o site e quero conversar sobre um projeto.",
  email: "contato@kronografx.com",
  instagram: "kronografx",

  /* Projetos: aparecem no destaque da home, na página Projetos e cada um ganha página própria */
  projetos: [
    {
      id: "e2-3-sinais",
      titulo: "3 Sinais",
      cliente: "E2 Finanças",
      subtitulo: "Educação financeira",
      categoria: "Finanças / Conteúdo para redes",
      disciplina: "Motion Design",
      ano: "2026",
      formato: "Reels 9:16",
      duracao: "0:36",
      cor: "#2a1f07",
      cor2: "#b8892a",
      vertical: true,
      video: "assets/video/e2.mp4",
      capa: "assets/img/e2-capa.jpg",
      fundo: "assets/img/e2-capa.jpg",
      specs: ["1080×1920", "SFX", "Áudio"],
      historia: [
        "A E2 Finanças queria falar com quem sente que o dinheiro some todo mês, sem cair no tom de sermão.",
        "O roteiro parte de uma virada de chave: o problema não é de dinheiro, é de sistema. A partir daí, três sinais que o público reconhece no próprio dia a dia, cada um com cards de interface e gráficos animados.",
        "No visual, a paleta preta e dourada da marca guia o ritmo até a chamada final para o Método Viva."
      ],
      frames: ["assets/img/e2-still-1.jpg", "assets/img/e2-still-2.jpg", "assets/img/e2-still-3.jpg", "assets/img/e2-still-4.jpg", "assets/img/e2-still-5.jpg", "assets/img/e2-still-6.jpg"],
      nota: ""
    },
    {
      id: "itau-um-unico-app",
      titulo: "Um único app",
      cliente: "Itaú",
      subtitulo: "Conceito de UI motion",
      categoria: "Banco digital / Apresentação de app",
      disciplina: "Motion Design",
      ano: "2026",
      formato: "Filme 16:9",
      duracao: "0:13",
      audio: false,
      cor: "#d9530a",
      cor2: "#0b1f8f",
      vertical: false,
      video: "assets/video/itau.mp4",
      capa: "assets/img/itau-capa.jpg",
      fundo: "assets/img/itau-still-2.jpg",
      specs: ["1920×1080", "UI", "30 fps"],
      historia: [
        "Um estudo de como apresentar um app de banco em poucos segundos: tela que entra em cena, interface que se revela e uma mensagem só.",
        "Tipografia cinética faz a ponte entre as telas, e cada transição existe para levar o olhar até a próxima informação, do convite inicial ao chamado para baixar o app."
      ],
      frames: ["assets/img/itau-still-1.jpg", "assets/img/itau-still-2.jpg", "assets/img/itau-still-3.jpg", "assets/img/itau-still-4.jpg", "assets/img/itau-still-5.jpg", "assets/img/itau-still-6.jpg"],
      nota: "Projeto conceitual de portfólio, sem vínculo com o Itaú Unibanco."
    },
    {
      id: "starbucks-seu-nome",
      titulo: "Seu nome no café",
      cliente: "Starbucks",
      subtitulo: "Conceito de motion para app",
      categoria: "Cafeteria / Apresentação de app",
      disciplina: "Motion Design",
      ano: "2026",
      formato: "Reels 9:16",
      duracao: "0:35",
      cor: "#00704a",
      cor2: "#1e3932",
      vertical: true,
      video: "assets/video/starbucks.mp4",
      capa: "assets/img/starbucks-capa.jpg",
      fundo: "assets/img/frames/starbucks-2.jpg",
      specs: ["1080×1920", "UI", "Áudio"],
      historia: [
        "Um estudo de como contar a personalização de um pedido de café em poucos segundos: de um número grande e uma pergunta simples até o app que já sabe o seu nome.",
        "Tipografia cinética, cards de interface e o verde da marca conduzem o ritmo até a chamada final."
      ],
      frames: ["assets/img/starbucks-still-1.jpg", "assets/img/starbucks-still-2.jpg", "assets/img/starbucks-still-3.jpg", "assets/img/starbucks-still-4.jpg", "assets/img/starbucks-still-5.jpg", "assets/img/starbucks-still-6.jpg"],
      nota: "Projeto conceitual de portfólio, sem vínculo com a Starbucks."
    }
  ],

  /* Carrossel inclinado da home: [imagem, id do projeto] */
  carrossel: [
    ["assets/img/frames/e2-1.jpg", "e2-3-sinais"],
    ["assets/img/frames/starbucks-3.jpg", "starbucks-seu-nome"],
    ["assets/img/frames/itau-2.jpg", "itau-um-unico-app"],
    ["assets/img/frames/e2-3.jpg", "e2-3-sinais"],
    ["assets/img/frames/starbucks-1.jpg", "starbucks-seu-nome"],
    ["assets/img/frames/itau-1.jpg", "itau-um-unico-app"],
    ["assets/img/frames/e2-4.jpg", "e2-3-sinais"],
    ["assets/img/frames/starbucks-2.jpg", "starbucks-seu-nome"],
    ["assets/img/frames/itau-3.jpg", "itau-um-unico-app"],
    ["assets/img/frames/e2-6.jpg", "e2-3-sinais"],
    ["assets/img/frames/starbucks-4.jpg", "starbucks-seu-nome"],
    ["assets/img/frames/itau-4.jpg", "itau-um-unico-app"],
    ["assets/img/frames/e2-5.jpg", "e2-3-sinais"],
    ["assets/img/frames/starbucks-6.jpg", "starbucks-seu-nome"],
    ["assets/img/frames/itau-6.jpg", "itau-um-unico-app"],
    ["assets/img/frames/e2-8.jpg", "e2-3-sinais"],
    ["assets/img/frames/starbucks-5.jpg", "starbucks-seu-nome"],
    ["assets/img/frames/itau-5.jpg", "itau-um-unico-app"]
  ],

  faq: [
    ["Que tipo de projeto vocês fazem?", "Vídeos de motion para marcas e produtos, conteúdo para redes (Reels, Shorts, TikTok), vinhetas e aberturas, efeitos visuais e a finalização de vídeos já gravados."],
    ["Quanto custa um vídeo?", "Depende da duração, do estilo e do prazo. Você conta a ideia pelo WhatsApp e recebe uma proposta com escopo, cronograma e valor antes de qualquer coisa começar."],
    ["Quanto tempo leva?", "O prazo é definido junto com a proposta, com data para cada etapa: roteiro, design, animação e entrega."],
    ["Posso pedir ajustes?", "Sim. O número de rodadas de ajuste fica combinado na proposta, etapa por etapa."],
    ["Vocês atendem clientes de outras cidades?", "Sim. Trabalhamos de forma remota: reuniões, aprovações e entregas acontecem online."],
    ["Em quais formatos o vídeo é entregue?", "No formato certo para onde ele vai rodar: 9:16 para Reels e Stories, 16:9 para YouTube e TV, 1:1 ou 4:5 para feed."]
  ]
};
