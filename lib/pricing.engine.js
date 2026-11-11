// motor de precificação — servidor exclusivo.
// portado de knodoriapp/server/pricing-engine.ts (cloudflare worker) para o backend node.
// as taxas internas nunca chegam ao navegador: o client recebe apenas os valores finais em centavos.
// toda a aritmética usa inteiros (centavos) para evitar deriva de ponto flutuante.
//
// obs.: as chaves do objeto de resposta (baseJpy, baseCents, installments...) e de entrada
// (valorJpy, itens, gomId) são o contrato da api com o frontend e não podem mudar de nome.

// tabela de taxas de cartão (1x a 7x) — nunca exposta ao client
const taxas_cartao = [
  { parcelas: 1, taxa: 0.0498 },
  { parcelas: 2, taxa: 0.0964 },
  { parcelas: 3, taxa: 0.1123 },
  { parcelas: 4, taxa: 0.1136 },
  { parcelas: 5, taxa: 0.1431 },
  { parcelas: 6, taxa: 0.1432 },
  { parcelas: 7, taxa: 0.1672 },
];

// espelho de config_taxas_default (src/app/lib/gom-types.ts no frontend)
const config_taxas_default = {
  spread_wise: 2.5,
  taxa_idr_brl: 0.000286,
  fator_idr_jpy: 123,
  acrescimo_base_jpy: 200,
  markup_itens: {
    photocard: 2.5,
    postcard: 2.5,
    adesivo: 2.5,
    pequeno: 8.0,
    pelucia_pequena: 10.0,
    album: 15.0,
    grande: 25.0,
  },
};

// validação equivalente ao schema zod do worker. retorna { ok, data } ou { ok: false, message }.
function validar_entrada(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, message: 'entrada inválida.' };
  }

  const valor_jpy = body.valorJpy;
  if (typeof valor_jpy !== 'number' || Number.isNaN(valor_jpy)) {
    return { ok: false, message: 'valorJpy deve ser número' };
  }
  if (!Number.isInteger(valor_jpy)) return { ok: false, message: 'valorJpy deve ser inteiro' };
  if (valor_jpy <= 0) return { ok: false, message: 'valorJpy deve ser positivo' };
  if (valor_jpy > 9999999) return { ok: false, message: 'valorJpy excessivamente alto' };

  const itens = body.itens === undefined ? {} : body.itens;
  if (!itens || typeof itens !== 'object' || Array.isArray(itens)) {
    return { ok: false, message: 'itens deve ser um objeto' };
  }
  for (const [chave, qtd] of Object.entries(itens)) {
    if (!Number.isInteger(qtd) || qtd < 0 || qtd > 99) {
      return { ok: false, message: `quantidade inválida para ${chave}` };
    }
  }

  if (body.gomId !== undefined && typeof body.gomId !== 'string') {
    return { ok: false, message: 'gomId deve ser texto' };
  }

  return { ok: true, data: { valor_jpy, itens, gom_id: body.gomId } };
}

function montar_parcelas(base_cents) {
  const resultado = [];

  // pix — referência de custo mínimo, sempre o primeiro elemento
  resultado.push({
    parcelas: 1,
    formaPagamento: 'pix',
    totalCents: base_cents,
    parcelaCents: base_cents,
    taxaPercent: 0,
    economiaVsPix: 0,
  });

  // cartão 1x a 7x
  for (const { parcelas, taxa } of taxas_cartao) {
    const total_cents = Math.round(base_cents * (1 + taxa));
    const parcela_cents = Math.floor(total_cents / parcelas);

    resultado.push({
      parcelas,
      formaPagamento: 'cartao',
      totalCents: total_cents,
      parcelaCents: parcela_cents,
      taxaPercent: parseFloat((taxa * 100).toFixed(2)),
      economiaVsPix: base_cents - total_cents, // negativo = mais caro que pix
    });
  }

  return resultado; // sempre 8 elementos: [pix, 1x, 2x, 3x, 4x, 5x, 6x, 7x]
}

function motor_precificacao(valor_jpy, itens, config) {
  // etapa 1: acréscimo fixo em jpy
  const jpy_total = valor_jpy + config.acrescimo_base_jpy;

  // etapa 2: jpy → idr (inteiro × inteiro)
  const valor_idr = jpy_total * config.fator_idr_jpy;

  // etapa 3: idr → brl, arredondado para centavos neste ponto
  const brl_bruto_cents = Math.round(valor_idr * config.taxa_idr_brl * 100);

  // etapa 4: spread wise (percentual)
  const brl_com_spread_cents = Math.round(brl_bruto_cents * (1 + config.spread_wise / 100));

  // etapa 5: markup por item (unitário em centavos antes de multiplicar)
  const markup_cents = Object.entries(itens).reduce((acc, [chave, qtd]) => {
    if (!qtd || qtd <= 0) return acc;
    const unit_cents = Math.round((config.markup_itens[chave] ?? 0) * 100);
    return acc + unit_cents * qtd;
  }, 0);

  // etapa 6: preço final à vista (pix)
  const base_cents = brl_com_spread_cents + markup_cents;

  return {
    baseJpy: valor_jpy,
    baseCents: base_cents,
    installments: montar_parcelas(base_cents),
  };
}

async function calcular_preco(data) {
  // 🔌 buscar config específica da gom no banco quando data.gom_id existir
  const config = config_taxas_default;
  return motor_precificacao(data.valor_jpy, data.itens, config);
}

module.exports = { validar_entrada, calcular_preco };
