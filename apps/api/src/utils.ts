import { env } from './env.js';

export const brl = (n: number): string => 'R$ ' + n.toLocaleString('pt-BR');

/**
 * Rótulo da remuneração: "A combinar" quando a vaga não tem valor definido,
 * um único valor quando mín. e máx. coincidem, e a faixa nos demais casos.
 */
export function faixaSalarial(min?: number | null, max?: number | null): string {
  if (min == null && max == null) return 'A combinar';
  if (min == null) return `até ${brl(max as number)}`;
  if (max == null) return `a partir de ${brl(min)}`;
  return min === max ? brl(min) : `${brl(min)} – ${brl(max)}`;
}

/** "há 2 dias", "há 1 semana" — mesmo formato do protótipo. */
export function publicadaLabel(date: Date): string {
  const dias = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'há 1 dia';
  if (dias < 7) return `há ${dias} dias`;
  const semanas = Math.floor(dias / 7);
  if (semanas === 1) return 'há 1 semana';
  if (semanas < 5) return `há ${semanas} semanas`;
  const meses = Math.floor(dias / 30);
  return meses <= 1 ? 'há 1 mês' : `há ${meses} meses`;
}

/**
 * Permalink de checkout da Shopify para a assinatura de parceria.
 * Formato: https://{loja}/cart/{variantId}:1?selling_plan={id}&attributes[...]
 */
export function shopifyCheckoutUrl(attrs: Record<string, string> = {}): {
  url: string;
  configurado: boolean;
} {
  const { storeDomain, variantId, sellingPlanId } = env.shopify;
  if (!storeDomain || !variantId) {
    return { url: '', configurado: false };
  }
  const params = new URLSearchParams();
  if (sellingPlanId) params.set('selling_plan', sellingPlanId);
  for (const [k, v] of Object.entries(attrs)) {
    if (v) params.set(`attributes[${k}]`, v);
  }
  const qs = params.toString();
  return {
    url: `https://${storeDomain}/cart/${variantId}:1${qs ? `?${qs}` : ''}`,
    configurado: true,
  };
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const SETORES_EXTRA = [
  'Saúde',
  'Educação',
  'Jurídico',
  'Engenharia',
  'Varejo',
  'Construção Civil',
  'Agronegócio',
  'Hotelaria e Turismo',
];
