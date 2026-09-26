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

let valorAtual = '0';   // número sendo digitado
let valorAnterior = '';   // número antes do operador
let operadorAtual = '';   // operador escolhido (+, -, *, /)
let novoNumero = false; // flag: próximo dígito começa número novo


// ============================================
// REFERÊNCIAS AOS ELEMENTOS HTML
// ============================================

const display = document.getElementById('display');
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
  novoNumero = true; // próximo dígito começa número novo

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
  valorAtual = '0';
  valorAnterior = '';
  operadorAtual = '';
  novoNumero = false;
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

document.addEventListener('keydown', function (evento) {
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