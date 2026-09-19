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