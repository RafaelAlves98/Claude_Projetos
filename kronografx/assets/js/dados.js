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
      conceitual: true,
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
      conceitual: true,
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

  /* Traduções (o texto em português fica nos campos acima; aqui só en e es) */
  traducoes: {
    whatsappTexto: {
      en: "Hello, Kronografx! I saw the website and I'd like to talk about a project.",
      es: "¡Hola, Kronografx! Vi el sitio y quiero conversar sobre un proyecto."
    },
    projetos: {
      "e2-3-sinais": {
        en: {
          titulo: "3 Signs",
          subtitulo: "Financial education",
          categoria: "Finance / Social media content",
          formato: "Reels 9:16",
          specs: ["1080×1920", "SFX", "Audio"],
          historia: [
            "E2 Finanças wanted to talk to people who feel their money disappears every month, without sounding preachy.",
            "The script starts with a mindset shift: the problem isn't money, it's the system. From there, three signs the audience recognizes in their own day-to-day, each with interface cards and animated charts.",
            "Visually, the brand's black-and-gold palette drives the rhythm up to the final call to action for the Método Viva."
          ],
          nota: ""
        },
        es: {
          titulo: "3 Señales",
          subtitulo: "Educación financiera",
          categoria: "Finanzas / Contenido para redes",
          formato: "Reels 9:16",
          specs: ["1080×1920", "SFX", "Audio"],
          historia: [
            "E2 Finanças quería hablarle a quien siente que el dinero desaparece cada mes, sin caer en el tono de sermón.",
            "El guion parte de un cambio de chip: el problema no es de dinero, es de sistema. A partir de ahí, tres señales que el público reconoce en su propio día a día, cada una con tarjetas de interfaz y gráficos animados.",
            "En lo visual, la paleta negra y dorada de la marca guía el ritmo hasta el llamado final al Método Viva."
          ],
          nota: ""
        }
      },
      "itau-um-unico-app": {
        en: {
          titulo: "One single app",
          subtitulo: "UI motion concept",
          categoria: "Digital bank / App presentation",
          formato: "Film 16:9",
          specs: ["1920×1080", "UI", "30 fps"],
          historia: [
            "A study in how to present a banking app in a few seconds: a screen enters the scene, the interface reveals itself, and there's a single message.",
            "Kinetic typography bridges the screens, and every transition exists to carry the eye to the next piece of information, from the opening invitation to the call to download the app."
          ],
          nota: "Conceptual portfolio project, not affiliated with Itaú Unibanco."
        },
        es: {
          titulo: "Una sola app",
          subtitulo: "Concepto de motion de UI",
          categoria: "Banco digital / Presentación de app",
          formato: "Película 16:9",
          specs: ["1920×1080", "UI", "30 fps"],
          historia: [
            "Un estudio de cómo presentar una app de banco en pocos segundos: una pantalla que entra en escena, una interfaz que se revela y un solo mensaje.",
            "La tipografía cinética hace de puente entre las pantallas, y cada transición existe para llevar la mirada hasta la siguiente información, desde la invitación inicial hasta el llamado para descargar la app."
          ],
          nota: "Proyecto conceptual de portafolio, sin vínculo con Itaú Unibanco."
        }
      },
      "starbucks-seu-nome": {
        en: {
          titulo: "Your name on the cup",
          subtitulo: "App motion concept",
          categoria: "Coffee shop / App presentation",
          formato: "Reels 9:16",
          specs: ["1080×1920", "UI", "Audio"],
          historia: [
            "A study in how to tell the story of a personalized coffee order in a few seconds: from a big number and a simple question to the app that already knows your name.",
            "Kinetic typography, interface cards and the brand's green set the rhythm up to the final call."
          ],
          nota: "Conceptual portfolio project, not affiliated with Starbucks."
        },
        es: {
          titulo: "Tu nombre en el café",
          subtitulo: "Concepto de motion para app",
          categoria: "Cafetería / Presentación de app",
          formato: "Reels 9:16",
          specs: ["1080×1920", "UI", "Audio"],
          historia: [
            "Un estudio de cómo contar la personalización de un pedido de café en pocos segundos: de un número grande y una pregunta simple hasta la app que ya sabe tu nombre.",
            "Tipografía cinética, tarjetas de interfaz y el verde de la marca llevan el ritmo hasta el llamado final."
          ],
          nota: "Proyecto conceptual de portafolio, sin vínculo con Starbucks."
        }
      }
    },
    faq: {
      en: [
        ["What kind of projects do you do?", "Motion videos for brands and products, social media content (Reels, Shorts, TikTok), intros and bumpers, visual effects and finishing for videos already shot."],
        ["How much does a video cost?", "It depends on the length, style and deadline. You tell us the idea on WhatsApp and get a proposal with scope, schedule and price before anything starts."],
        ["How long does it take?", "The deadline is set together with the proposal, with a date for each stage: script, design, animation and delivery."],
        ["Can I ask for revisions?", "Yes. The number of revision rounds is agreed in the proposal, stage by stage."],
        ["Do you work with clients in other cities?", "Yes. We work remotely: meetings, approvals and deliveries happen online."],
        ["What formats is the video delivered in?", "In the right format for where it will run: 9:16 for Reels and Stories, 16:9 for YouTube and TV, 1:1 or 4:5 for the feed."]
      ],
      es: [
        ["¿Qué tipo de proyectos hacen?", "Videos de motion para marcas y productos, contenido para redes (Reels, Shorts, TikTok), viñetas y aperturas, efectos visuales y la finalización de videos ya grabados."],
        ["¿Cuánto cuesta un video?", "Depende de la duración, el estilo y el plazo. Cuentas la idea por WhatsApp y recibes una propuesta con alcance, cronograma y valor antes de que empiece nada."],
        ["¿Cuánto tiempo toma?", "El plazo se define junto con la propuesta, con fecha para cada etapa: guion, diseño, animación y entrega."],
        ["¿Puedo pedir ajustes?", "Sí. El número de rondas de ajuste queda acordado en la propuesta, etapa por etapa."],
        ["¿Atienden a clientes de otras ciudades?", "Sí. Trabajamos de forma remota: reuniones, aprobaciones y entregas ocurren en línea."],
        ["¿En qué formatos se entrega el video?", "En el formato correcto para donde va a correr: 9:16 para Reels y Stories, 16:9 para YouTube y TV, 1:1 o 4:5 para el feed."]
      ]
    }
  },

  faq: [
    ["Que tipo de projeto vocês fazem?", "Vídeos de motion para marcas e produtos, conteúdo para redes (Reels, Shorts, TikTok), vinhetas e aberturas, efeitos visuais e a finalização de vídeos já gravados."],
    ["Quanto custa um vídeo?", "Depende da duração, do estilo e do prazo. Você conta a ideia pelo WhatsApp e recebe uma proposta com escopo, cronograma e valor antes de qualquer coisa começar."],
    ["Quanto tempo leva?", "O prazo é definido junto com a proposta, com data para cada etapa: roteiro, design, animação e entrega."],
    ["Posso pedir ajustes?", "Sim. O número de rodadas de ajuste fica combinado na proposta, etapa por etapa."],
    ["Vocês atendem clientes de outras cidades?", "Sim. Trabalhamos de forma remota: reuniões, aprovações e entregas acontecem online."],
    ["Em quais formatos o vídeo é entregue?", "No formato certo para onde ele vai rodar: 9:16 para Reels e Stories, 16:9 para YouTube e TV, 1:1 ou 4:5 para feed."]
  ]
};
