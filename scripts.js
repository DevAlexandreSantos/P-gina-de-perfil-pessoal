// ============================================
//  SCRIPT.JS — Página de Perfil Pessoal
//  Conceitos usados:
//  - querySelector / querySelectorAll
//  - Intersection Observer (detectar scroll)
//  - addEventListener
//  - classList.add
//  - setTimeout
// ============================================


// ============================================
// 1. ANIMAÇÃO AO ROLAR A PÁGINA
//    Usa o Intersection Observer para detectar
//    quando uma seção entra na tela e adicionar
//    a classe 'visivel' que ativa a animação CSS
// ============================================

const secoes = document.querySelectorAll('.secao');

const observador = new IntersectionObserver(
  function(entradas) {
    entradas.forEach(function(entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');

        if (entrada.target.id === 'habilidades') {
          animarBarras();
        }

        observador.unobserve(entrada.target); // <-- para de observar
      }
    });
  },
  { threshold: 0.15 }
);

// Observa todas as seções
secoes.forEach(function(secao) {
  observador.observe(secao);
});


// ============================================
// 2. ANIMAÇÃO DAS BARRAS DE HABILIDADE
//    As barras começam com width: 0 no CSS
//    Esta função aplica o width real para
//    acionar a transição CSS
// ============================================

function animarBarras() {
  const barras = document.querySelectorAll('.barra');

  barras.forEach(function(barra) {
    const larguraFinal = barra.style.width; // ex: "85%"
    barra.style.width = '0';               // reseta para 0

    // Pequeno delay para o browser perceber a mudança antes de animar
    setTimeout(function() {
      barra.style.width = larguraFinal;
    }, 100);
  });
}


// ============================================
// 3. FORMULÁRIO DE CONTATO
//    Intercepta o envio, evita recarregar
//    a página e mostra mensagem de sucesso
// ============================================

const formulario = document.getElementById('formulario');
const mensagemEnviada = document.getElementById('mensagem-enviada');

formulario.addEventListener('submit', function(evento) {
  evento.preventDefault(); // impede o recarregamento da página

  const nome = document.getElementById('nome').value;

  // Mostra mensagem de sucesso personalizada
  mensagemEnviada.textContent = '✅ Obrigado, ' + nome + '! Mensagem enviada com sucesso.';
  mensagemEnviada.style.display = 'block';

  // Limpa o formulário
  formulario.reset();

  // Esconde a mensagem depois de 4 segundos
  setTimeout(function() {
    mensagemEnviada.style.display = 'none';
  }, 4000);
});


// ============================================
// 4. DESTAQUE NA NAVEGAÇÃO
//    Marca o link ativo conforme a seção
//    que está visível na tela
// ============================================

const linksNav = document.querySelectorAll('.nav a');

const observadorNav = new IntersectionObserver(
  function(entradas) {
    entradas.forEach(function(entrada) {
      if (entrada.isIntersecting) {
        const idSecao = entrada.target.id;

        // Remove o destaque de todos os links
        linksNav.forEach(function(link) {
          link.style.color = '';
          link.style.borderBottomColor = 'transparent';
        });

        // Adiciona destaque no link correspondente
        const linkAtivo = document.querySelector('.nav a[href="#' + idSecao + '"]');
        if (linkAtivo) {
          linkAtivo.style.color = '#4A90D9';
          linkAtivo.style.borderBottomColor = '#4A90D9';
        }
      }
    });
  },
  { threshold: 0.5 } // dispara quando 50% da seção está visível
);

secoes.forEach(function(secao) {
  observadorNav.observe(secao);
});

let circulo = document.querySelector(".circulo");
function trocarCor(cor) {
    circulo.style.backgroundColor=cor;
}

function resetarPersonagem() {
    document.getElementById('imagem-personagem').src = 'img/trio.png';
    document.getElementById('personagem-info').innerHTML = '';
}
function mostrarPersonagem(personagem) {
    const info = document.getElementById('personagem-info');
    const imagem = document.getElementById('imagem-personagem');

    if (personagem === 'naruto') {
        info.innerHTML = `
            <h2>Naruto Uzumaki</h2>
            <p>É o protagonista da série, um ninja determinado e sonhador.</p>
        `;
        imagem.src = "img/naruto.png";
    } else if (personagem === 'sakura') {
        info.innerHTML = `
            <h2>Sakura Haruno</h2>
            <p>É uma ninja médica inteligente e habilidosa.</p>
        `;
        imagem.src = "img/sakura.png";
    } else if (personagem === 'sasuke') {
        info.innerHTML = `
            <h2>Sasuke Uchiha</h2>
            <p>É um dos últimos membros do clã Uchiha, muito poderoso.</p>
        `;
        imagem.src = "img/sasuke.png";
    }

    // Faz a imagem girar
    imagem.classList.remove('girar');
    void imagem.offsetWidth;
    imagem.classList.add('girar');
}