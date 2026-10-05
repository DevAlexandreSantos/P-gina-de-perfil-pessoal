// ============================================
//  MAIN.JS — Página de Perfil Pessoal
//  Conceitos usados:
//  - querySelector / querySelectorAll
//  - IntersectionObserver (detectar scroll)
//  - addEventListener
//  - classList.add / classList.toggle
//  - setTimeout
// ============================================

const secoes = document.querySelectorAll('.secao');


// ============================================
// 1. ANIMAÇÃO AO ROLAR A PÁGINA
//    Quando uma seção entra na tela, ganha a
//    classe 'visivel'. O CSS cuida da animação
//    da seção e das barras de habilidade.
// ============================================

const observadorEntrada = new IntersectionObserver(
  function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observadorEntrada.unobserve(entrada.target); // anima só uma vez
      }
    });
  },
  // threshold 0 + margem inferior: funciona mesmo com seções mais altas que a tela
  { threshold: 0, rootMargin: '0px 0px -10% 0px' }
);

secoes.forEach(function (secao) {
  observadorEntrada.observe(secao);
});


// ============================================
// 2. DESTAQUE NA NAVEGAÇÃO
//    Marca o link da seção que está no meio
//    da tela. Usa a classe .ativo (o visual
//    fica no CSS, não aqui).
// ============================================

const linksNav = document.querySelectorAll('.nav a');

const observadorNav = new IntersectionObserver(
  function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;

      linksNav.forEach(function (link) {
        link.classList.toggle('ativo', link.getAttribute('href') === '#' + entrada.target.id);
      });
    });
  },
  // Faixa fina no meio da tela: só uma seção por vez cruza essa faixa
  { rootMargin: '-40% 0px -55% 0px' }
);

secoes.forEach(function (secao) {
  observadorNav.observe(secao);
});


// ============================================
// 3. FORMULÁRIO DE CONTATO
//    Não existe servidor aqui, então o
//    formulário abre o app de e-mail do
//    visitante com a mensagem já preenchida
//    (mailto:). Assim nada finge que foi enviado.
//
//    Quando quiser receber direto na caixa de
//    entrada, troque este trecho por um serviço
//    como Formspree, Web3Forms ou EmailJS.
// ============================================

const formulario = document.getElementById('formulario');
const mensagemEnviada = document.getElementById('mensagem-enviada');

if (formulario) {
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // impede o recarregamento da página

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
    const destino = formulario.dataset.destino;

    const assunto = 'Contato pelo portfólio — ' + nome;
    const corpo = mensagem + '\n\n' + nome + '\n' + email;

    window.location.href =
      'mailto:' + destino +
      '?subject=' + encodeURIComponent(assunto) +
      '&body=' + encodeURIComponent(corpo);

    mensagemEnviada.textContent =
      'Abrindo seu app de e-mail, ' + nome + '. Basta apertar em enviar por lá.';
    mensagemEnviada.hidden = false;

    formulario.reset();

    // Esconde o aviso depois de 6 segundos
    setTimeout(function () {
      mensagemEnviada.hidden = true;
    }, 6000);
  });
}


// ============================================
// 4. PROJETOS DO GITHUB
//    Busca os repositórios públicos na API do
//    GitHub e monta os cards sozinho. O resultado
//    fica 1 hora no localStorage, porque a API
//    aceita só 60 consultas por hora por IP.
//    Se algo falhar, o botão "Ver todos no GitHub"
//    continua funcionando.
// ============================================

const USUARIO_GITHUB = 'DevAlexandreSantos';
const MAX_REPOS = 6;
const CACHE_CHAVE = 'repos-github';
const CACHE_MINUTOS = 60;

// Repositórios que não precisam aparecer (nomes em minúsculo):
// este próprio site e o repositório de README do perfil
const REPOS_IGNORADOS = ['p-gina-de-perfil-pessoal', USUARIO_GITHUB.toLowerCase()];

const listaRepos = document.getElementById('repos-github');

function lerCache() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CACHE_CHAVE));
    if (salvo && Date.now() - salvo.hora < CACHE_MINUTOS * 60 * 1000) {
      return salvo.repos;
    }
  } catch (erro) {
    // cache inválido ou indisponível: segue para a API
  }
  return null;
}

function salvarCache(repos) {
  try {
    localStorage.setItem(CACHE_CHAVE, JSON.stringify({ hora: Date.now(), repos: repos }));
  } catch (erro) {
    // localStorage bloqueado: tudo bem, só não guarda
  }
}

async function buscarRepos() {
  const emCache = lerCache();
  if (emCache) return emCache;

  const resposta = await fetch(
    'https://api.github.com/users/' + USUARIO_GITHUB + '/repos?sort=updated&per_page=30'
  );
  if (!resposta.ok) throw new Error('GitHub respondeu ' + resposta.status);

  const todos = await resposta.json();
  const repos = todos
    .filter(function (repo) {
      return !repo.fork && !REPOS_IGNORADOS.includes(repo.name.toLowerCase());
    })
    .slice(0, MAX_REPOS)
    .map(function (repo) {
      return {
        nome: repo.name,
        descricao: repo.description,
        linguagem: repo.language,
        url: repo.html_url
      };
    });

  salvarCache(repos);
  return repos;
}

// Monta o card com createElement/textContent:
// assim o texto vindo do GitHub nunca é interpretado como HTML
function criarCard(repo) {
  const card = document.createElement('div');
  card.className = 'card-projeto';

  const emoji = document.createElement('div');
  emoji.className = 'card-emoji';
  emoji.textContent = '📦';

  const titulo = document.createElement('h3');
  titulo.textContent = repo.nome;

  const descricao = document.createElement('p');
  descricao.textContent = repo.descricao || 'Sem descrição.';

  card.append(emoji, titulo, descricao);

  if (repo.linguagem) {
    const tags = document.createElement('div');
    tags.className = 'card-tags';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = repo.linguagem;
    tags.appendChild(tag);
    card.appendChild(tags);
  }

  const link = document.createElement('a');
  link.className = 'btn btn-card';
  link.href = repo.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Ver no GitHub';
  card.appendChild(link);

  return card;
}

function mostrarStatus(texto) {
  const aviso = document.createElement('p');
  aviso.className = 'repos-status';
  aviso.textContent = texto;
  listaRepos.replaceChildren(aviso);
}

async function carregarRepos() {
  if (!listaRepos) return;

  try {
    const repos = await buscarRepos();

    if (repos.length === 0) {
      mostrarStatus('Nenhum repositório público encontrado ainda.');
      return;
    }

    listaRepos.replaceChildren(...repos.map(criarCard));
  } catch (erro) {
    mostrarStatus('Não consegui carregar os repositórios agora. Veja todos pelo botão abaixo.');
  }
}

carregarRepos();