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
//  SCRIPT.JS — Calculadora
//  Conceitos usados:
//  - Variáveis (let)
//  - Funções
//  - Condicionais (if / else if)
//  - parseFloat (converter texto em número)
//  - getElementById e textContent
//  - Eventos com onclick no HTML
// ============================================


// ============================================
// ESTADO DA CALCULADORA
// Estas variáveis guardam o estado atual
// ============================================

let valorAtual   = '0';   // número sendo digitado
let valorAnterior = '';   // número antes do operador
let operadorAtual = '';   // operador escolhido (+, -, *, /)
let novoNumero    = false; // flag: próximo dígito começa número novo


// ============================================
// REFERÊNCIAS AOS ELEMENTOS HTML
// ============================================

const display   = document.getElementById('display');
const historico = document.getElementById('historico');


// ============================================
// ATUALIZAR O VISOR
// Sempre que mudar algo, chama essa função
// ============================================

function atualizarVisor() {
  // Se o número for muito longo, usa notação científica
  if (valorAtual.length > 10) {
    display.textContent = parseFloat(valorAtual).toExponential(4);
  } else {
    display.textContent = valorAtual;
  }
}


// ============================================
// DIGITAR UM NÚMERO
// Chamada quando o usuário clica em 0-9
// ============================================

function digito(numero) {
  if (novoNumero) {
    // Começa um número novo do zero
    valorAtual = numero;
    novoNumero = false;
  } else {
    // Adiciona dígito ao número atual
    if (valorAtual === '0' && numero !== '.') {
      valorAtual = numero; // substitui o 0 inicial
    } else if (valorAtual.length < 12) {
      valorAtual += numero; // concatena
    }
  }
  atualizarVisor();
}


// ============================================
// ADICIONAR PONTO DECIMAL
// Garante que só existe um ponto no número
// ============================================

function ponto() {
  if (novoNumero) {
    valorAtual = '0.';
    novoNumero = false;
  } else if (!valorAtual.includes('.')) {
    valorAtual += '.';
  }
  atualizarVisor();
}


// ============================================
// ESCOLHER OPERADOR (+, -, *, /)
// Guarda o valor atual e o operador
// ============================================

function operador(op) {
  // Se já tem operador e número novo não foi digitado, calcula primeiro
  if (valorAnterior !== '' && !novoNumero) {
    calcular(true); // cálculo parcial (não mostra histórico completo)
  }

  valorAnterior = valorAtual;
  operadorAtual = op;
  novoNumero    = true; // próximo dígito começa número novo

  // Mostra no histórico qual operador foi escolhido
  const simbolo = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  historico.textContent = valorAnterior + ' ' + simbolo[op];
}


// ============================================
// CALCULAR O RESULTADO
// Chamada pelo botão = ou internamente
// ============================================

function calcular(parcial) {
  // Se não há operador ou número anterior, não faz nada
  if (operadorAtual === '' || valorAnterior === '') return;

  const a = parseFloat(valorAnterior);
  const b = parseFloat(valorAtual);
  let resultado;

  // Realiza a operação correta
  if (operadorAtual === '+') resultado = a + b;
  else if (operadorAtual === '-') resultado = a - b;
  else if (operadorAtual === '*') resultado = a * b;
  else if (operadorAtual === '/') {
    if (b === 0) {
      // Divisão por zero → erro
      display.textContent = 'Erro';
      historico.textContent = '';
      valorAtual = '0';
      valorAnterior = '';
      operadorAtual = '';
      return;
    }
    resultado = a / b;
  }

  // Atualiza o histórico no visor
  if (!parcial) {
    const simbolo = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    historico.textContent = valorAnterior + ' ' + simbolo[operadorAtual] + ' ' + valorAtual + ' =';
    operadorAtual = '';
    valorAnterior = '';
  }

  // Evita casas decimais desnecessárias (ex: 0.1 + 0.2 = 0.30000000004)
  resultado = parseFloat(resultado.toFixed(10));

  valorAtual = resultado.toString();
  novoNumero = true;
  atualizarVisor();
}


// ============================================
// LIMPAR TUDO (botão AC)
// Volta ao estado inicial
// ============================================

function limpar() {
  valorAtual    = '0';
  valorAnterior = '';
  operadorAtual = '';
  novoNumero    = false;
  historico.textContent = '';
  atualizarVisor();
}


// ============================================
// INVERTER SINAL (botão +/-)
// Transforma positivo em negativo e vice-versa
// ============================================

function inverter() {
  valorAtual = (parseFloat(valorAtual) * -1).toString();
  atualizarVisor();
}


// ============================================
// PORCENTAGEM (botão %)
// Divide o número por 100
// ============================================

function porcentagem() {
  valorAtual = (parseFloat(valorAtual) / 100).toString();
  atualizarVisor();
}


// ============================================
// SUPORTE AO TECLADO
// Permite usar a calculadora pelo teclado físico
// ============================================

document.addEventListener('keydown', function(evento) {
  const tecla = evento.key;

  if (tecla >= '0' && tecla <= '9') digito(tecla);
  else if (tecla === '.') ponto();
  else if (tecla === '+') operador('+');
  else if (tecla === '-') operador('-');
  else if (tecla === '*') operador('*');
  else if (tecla === '/') {
    evento.preventDefault(); // evita abrir busca no Firefox
    operador('/');
  }
  else if (tecla === 'Enter' || tecla === '=') calcular();
  else if (tecla === 'Escape') limpar();
  else if (tecla === 'Backspace') {
    // Apaga o último dígito
    if (valorAtual.length > 1) {
      valorAtual = valorAtual.slice(0, -1);
    } else {
      valorAtual = '0';
    }
    atualizarVisor();
  }
});