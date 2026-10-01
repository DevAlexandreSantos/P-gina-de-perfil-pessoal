/* ============ CONFIGURAÇÃO ============
   1) No Google Planilhas: Compartilhar > "Qualquer pessoa com o link" > Leitor
   2) Cole abaixo o ID da planilha (trecho entre /d/ e /edit na URL)
   3) Ajuste o nome da aba se necessário
   Deixe SHEET_ID vazio para ver dados de exemplo. */
const SHEET_ID = "1UaL4ZdhPPI-gmX-Js8ECO-64-Tp-1Fp_Vy3LDI7EBxs";
const ABA = "Lancamentos";
const ABA_CART = "Carteira"; // colunas: ativo | categoria | quantidade | preco_medio | cotacao
/* Colunas da aba: data | tipo | categoria | descricao | valor
   tipo = Receita, Despesa ou Investimento */

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const brl = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
let dados = [], carteira = [], charts = {};
const DEMO_CART = [
  { ativo: "Tesouro Selic", categoria: "Renda fixa", qtd: 1, pm: 2600, cot: 2790 },
  { ativo: "PETR4", categoria: "Variável", qtd: 40, pm: 34, cot: 38.5 },
  { ativo: "ITSA4", categoria: "Variável", qtd: 120, pm: 9.2, cot: 10.1 }
];

const DEMO = (() => {
  const d = [];
  const rec = [7600, 7800, 7700, 8000, 7900, 8100, 0, 0, 0, 0, 0, 0];
  for (let m = 0; m < 6; m++) {
    const mm = String(m + 4).padStart(2, "0");
    d.push({ data: `2026-${mm}-05`, tipo: "receita", categoria: "Salário", descricao: "Salário", valor: rec[m] });
    d.push({ data: `2026-${mm}-06`, tipo: "despesa", categoria: "Moradia", descricao: "Aluguel", valor: 1500 });
    d.push({ data: `2026-${mm}-10`, tipo: "despesa", categoria: "Alimentação", descricao: "Supermercado", valor: 780 + m * 10 });
    d.push({ data: `2026-${mm}-12`, tipo: "despesa", categoria: "Educação", descricao: "Faculdade", valor: 450 });
    d.push({ data: `2026-${mm}-15`, tipo: "despesa", categoria: "Transporte", descricao: "Combustível", valor: 410 });
    d.push({ data: `2026-${mm}-20`, tipo: "despesa", categoria: "Lazer", descricao: "Lazer", valor: 200 + m * 15 });
    d.push({ data: `2026-${mm}-25`, tipo: "investimento", categoria: "Renda fixa", descricao: "Tesouro", valor: 800 });
    d.push({ data: `2026-${mm}-26`, tipo: "investimento", categoria: "Variável", descricao: "Ações", valor: 380 });
  }
  return d;
})();

function csv(t) {
  const rows = []; let r = [], c = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch == '"' && t[i + 1] == '"') { c += '"'; i++ } else if (ch == '"') q = false; else c += ch }
    else if (ch == '"') q = true;
    else if (ch == ",") { r.push(c); c = "" }
    else if (ch == "\n" || ch == "\r") { if (ch == "\r" && t[i + 1] == "\n") i++; r.push(c); c = ""; rows.push(r); r = [] }
    else c += ch;
  }
  if (c || r.length) { r.push(c); rows.push(r) }
  return rows;
}
function num(s) {
  s = String(s).replace(/[R$\s]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  return parseFloat(s) || 0;
}
function parseData(s) {
  s = String(s).trim();
  let m = s.match(/^Date\((\d{4}),\s*(\d{1,2})/);            // Date(2026,8,5) — mês já vem de 0 a 11
  if (m) return { a: +m[1], m: +m[2] };
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);   // dd/mm/aaaa ou dd/mm/aa
  if (m) return { a: +m[3] < 100 ? 2000 + +m[3] : +m[3], m: +m[2] - 1 };
  m = s.match(/^(\d{4})-(\d{2})/);                            // aaaa-mm-dd
  if (m) return { a: +m[1], m: +m[2] - 1 };
  if (/^\d{4,6}$/.test(s)) {                                   // número serial de planilha
    const d = new Date(Date.UTC(1899, 11, 30) + +s * 864e5);
    return { a: d.getUTCFullYear(), m: d.getUTCMonth() };
  }
  return null;
}
function norm(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") }

async function carregar() {
  const msg = document.getElementById("msg");
  if (!SHEET_ID) { dados = DEMO; carteira = DEMO_CART; msg.textContent = "Mostrando dados de exemplo. Preencha SHEET_ID no código para usar sua planilha."; return }
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(ABA)}`;
    const res = await fetch(url); if (!res.ok) throw new Error(res.status);
    const all = csv(await res.text()).filter(r => r.some(x => x.trim()));
    const H = r => r.map(x => norm(x.trim()));
    let hi = all.findIndex(r => H(r).includes("tipo") && H(r).includes("valor"));
    const ix = n => hi >= 0 ? H(all[hi]).indexOf(n) : -1;
    const c = { data: ix("data"), tipo: ix("tipo"), cat: ix("categoria"), desc: ix("descricao"), val: ix("valor") };
    if (hi < 0 || Object.values(c).some(v => v < 0)) { hi = 0; Object.assign(c, { data: 0, tipo: 1, cat: 2, desc: 3, val: 4 }); }
    const rows = all.slice(hi + 1).filter(r => r[c.tipo] && r[c.val]);
    dados = rows.map(r => ({ data: r[c.data] || "", tipo: norm(r[c.tipo].trim()), categoria: (r[c.cat] || "").trim(), descricao: (r[c.desc] || "").trim(), valor: num(r[c.val]) }));
    const ok = dados.filter(d => parseData(d.data)).length;
    msg.textContent = `Aba ${ABA}: ${dados.length} lançamentos lidos, ${ok} com data válida.`;
    if (!ok) msg.textContent += ` Cabeçalhos encontrados: ${(all[0] || []).join(" | ")}. Confira o nome da aba e a coluna data.`;
    try {
      const rc = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(ABA_CART)}`);
      if (!rc.ok) throw new Error(rc.status);
      carteira = csv(await rc.text()).slice(1).filter(r => r[0] && r.length >= 5)
        .map(r => ({ ativo: r[0].trim(), categoria: r[1].trim(), qtd: num(r[2]), pm: num(r[3]), cot: num(r[4]) })).filter(a => a.qtd);
    } catch (e) { carteira = []; msg.textContent += " Aba Carteira não encontrada: o investimento usa só os aportes."; }
  } catch (e) {
    dados = DEMO; carteira = DEMO_CART; msg.textContent = "Não foi possível ler a planilha (confira o compartilhamento e o nome da aba). Mostrando dados de exemplo.";
  }
}

function filtros() {
  const anos = [...new Set(dados.map(d => parseData(d.data)?.a).filter(Boolean))].sort((a, b) => b - a);
  if (!anos.length) anos.push(new Date().getFullYear());
  const A = document.getElementById("ano"), M = document.getElementById("mes");
  const a0 = A.value, m0 = M.value;
  A.innerHTML = anos.map(a => `<option>${a}</option>`).join("");
  M.innerHTML = '<option value="">Mês: todos</option>' + MESES.map((n, i) => `<option value="${i}">${n}</option>`).join("");
  if (anos.map(String).includes(a0)) A.value = a0; if (m0) M.value = m0;
}

function soma(l, t) { return l.filter(d => d.tipo.startsWith(t)).reduce((s, d) => s + d.valor, 0) }

function render() {
  const ano = +document.getElementById("ano").value, mv = document.getElementById("mes").value;
  const doAno = dados.filter(d => parseData(d.data)?.a === ano);
  const sel = mv === "" ? doAno : doAno.filter(d => parseData(d.data).m === +mv);
  const R = soma(sel, "receita"), D = soma(sel, "despesa"), I = soma(sel, "invest");
  const atual = carteira.reduce((s, a) => s + a.qtd * a.cot, 0), custo = carteira.reduce((s, a) => s + a.qtd * a.pm, 0);
  const rent = custo ? (atual / custo - 1) * 100 : null;
  kIs.textContent = carteira.length ? `Aplicado: ${brl(custo)}${rent === null ? "" : ` (${rent >= 0 ? "+" : ""}${rent.toFixed(1)}%)`}` : "";
  kR.textContent = brl(R); kD.textContent = brl(D); kI.textContent = brl(carteira.length ? atual : I); kS.textContent = brl(R - D - I);

  // por mês (meses com dados)
  const ms = [...new Set(doAno.map(d => parseData(d.data).m))].sort((a, b) => a - b);
  const pr = ms.map(m => soma(doAno.filter(d => parseData(d.data).m === m), "receita"));
  const pd = ms.map(m => soma(doAno.filter(d => parseData(d.data).m === m), "despesa"));
  const pi = ms.map(m => soma(doAno.filter(d => parseData(d.data).m === m), "invest"));
  const sal = ms.map((_, i) => pr[i] - pd[i] - pi[i]);
  desenhar("cMes", {
    type: "bar", data: {
      labels: ms.map(m => MESES[m]), datasets: [
        { label: "Receitas", data: pr, backgroundColor: "#5f9a25" },
        { label: "Despesas", data: pd, backgroundColor: "#e85454" },
        { type: "line", label: "Saldo", data: sal, borderColor: "#888", pointRadius: 0, tension: .3 }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: "#eee" } }, x: { grid: { display: false } } } }
  });

  // categorias de gasto
  const cat = {}; sel.filter(d => d.tipo.startsWith("despesa")).forEach(d => cat[d.categoria] = (cat[d.categoria] || 0) + d.valor);
  const cs = Object.entries(cat).sort((a, b) => b[1] - a[1]).slice(0, 6), mx = cs[0]?.[1] || 1;
  cats.innerHTML = cs.map(([n, v]) => `<div class="bar"><span>${n}</span><i style="width:${v / mx * 100}%" title="${brl(v)}"></i></div>`).join("") || "Sem dados";

  // acumulado
  let ac = 0; const acum = pi.map(v => ac += v);
  desenhar("cAcum", {
    type: "line", data: { labels: ms.map(m => MESES[m]), datasets: [{ data: acum, borderColor: "#3b8ad9", pointRadius: 0, tension: .3 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: "#eee" } }, x: { grid: { display: false } } } }
  });

  // investido por categoria
  const ic = {};
  if (carteira.length) { carteira.forEach(a => ic[a.categoria] = (ic[a.categoria] || 0) + a.qtd * a.cot); tInv.textContent = "Carteira por categoria (valor atual)"; }
  else { sel.filter(d => d.tipo.startsWith("invest")).forEach(d => ic[d.categoria] = (ic[d.categoria] || 0) + d.valor); tInv.textContent = "Investido por categoria"; }
  desenhar("cInv", {
    type: "doughnut", data: { labels: Object.keys(ic), datasets: [{ data: Object.values(ic), backgroundColor: ["#3b8ad9", "#8ab8ea", "#1f5fa8", "#bcd6f2"] }] },
    options: { cutout: "58%", plugins: { legend: { position: "right" } } }
  });

  // maiores despesas
  const top = sel.filter(d => d.tipo.startsWith("despesa")).sort((a, b) => b.valor - a.valor).slice(0, 4);
  document.getElementById("top").innerHTML = top.map(d => `<div class="row"><span>${d.descricao}</span><span>${Math.round(d.valor).toLocaleString("pt-BR")}</span></div>`).join("") || "Sem dados";

  // chips
  const pct = R ? I / R * 100 : 0;
  let vr = null;
  if (pd.length > 1 && pd[pd.length - 2]) vr = (pd[pd.length - 1] / pd[pd.length - 2] - 1) * 100;
  chips.innerHTML = `<span class="chip ok">% Investido: ${pct.toFixed(0)}%</span>` +
    (rent === null ? "" : `<span class="chip ${rent >= 0 ? "ok" : "bad"}">Rentabilidade da carteira: ${rent >= 0 ? "+" : ""}${rent.toFixed(1)}%</span>`) +
    (vr === null ? "" : `<span class="chip ${vr > 0 ? "bad" : "ok"}">Variação despesas: ${vr > 0 ? "+" : ""}${vr.toFixed(0)}%</span>`);
}

function desenhar(id, cfg) {
  charts[id]?.destroy();
  cfg.options = { responsive: true, maintainAspectRatio: false, ...cfg.options };
  charts[id] = new Chart(document.getElementById(id), cfg);
}

async function iniciar() { await carregar(); filtros(); render() }
document.getElementById("ano").onchange = render;
document.getElementById("mes").onchange = render;
document.getElementById("reload").onclick = iniciar;
iniciar();