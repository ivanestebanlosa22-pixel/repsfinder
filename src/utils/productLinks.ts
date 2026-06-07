export interface ParsedLink {
  platform: 'weidian' | 'taobao' | '1688' | 'unknown';
  productId: string;
  rawUrl: string;
}

export function parseProductLink(url: string): ParsedLink | null {
  if (!url || typeof url !== 'string') return null;

  const decoded = url.trim();

  const weidianMatch =
    decoded.match(/itemID[=:](\d+)/i) ||
    decoded.match(/weidian\.com\/item.*?(\d{5,})/) ||
    decoded.match(/weidian\.com\/.*?(\d{5,})/);
  if (weidianMatch) {
    return { platform: 'weidian', productId: weidianMatch[1], rawUrl: decoded };
  }

  const taobaoMatch =
    decoded.match(/[?&]id=(\d+)/i) ||
    decoded.match(/taobao\.com\/.*?(\d{12,})/);
  if (taobaoMatch) {
    return { platform: 'taobao', productId: taobaoMatch[1], rawUrl: decoded };
  }

  const ali1688Match =
    decoded.match(/offer[\/=](\d+)/i) ||
    decoded.match(/1688\.com\/.*?(\d{12,})/);
  if (ali1688Match) {
    return { platform: '1688', productId: ali1688Match[1], rawUrl: decoded };
  }

  return null;
}

export interface AgentLink {
  id: string;
  name: string;
  feePercent: number;
  shippingEstimate: string;
  buyUrl: string;
  registerUrl: string;
  logo: string;
}

export const AGENT_REGISTER_URLS: Record<string, string> = {
  mulebuy: 'https://mulebuy.com/register?ref=200642502',
  joyagoo: 'https://joyagoo.com/register?ref=300768147',
  usfans: 'https://www.usfans.com/register?ref=RCGD5YSI',
  hipobuy: 'https://hipobuy.com/register?inviteCode=YZKOGE9NE',
  litbuy: 'https://oopbuy.com/register?inviteCode=GH40R4J0O',
  oopbuy: 'https://oopbuy.com/register?inviteCode=GH40R4J0O',
  acbuy: 'https://www.acbuy.com/register?u=UD3WIU',
  allchinabuy: 'https://www.allchinabuy.com/register?ref=REPSFINDER',
  superbuy: 'https://www.superbuy.com/en/page/register/?partnercode=Ey3NrI',
  kakobuy: 'https://www.kakobuy.com/register?affcode=hc9hzsSI',
};

function getPlatformParam(platform: string): string {
  switch (platform) {
    case 'weidian': return 'WD';
    case 'taobao': return 'TB';
    case '1688': return 'ALI';
    default: return 'WD';
  }
}

export function generateAgentLinks(parsed: ParsedLink): AgentLink[] {
  const { platform, productId } = parsed;
  const plat = getPlatformParam(platform);

  const agentConfigs: { id: string; name: string; feePercent: number; shipping: string; builder: (pid: string, p: string) => string }[] = [
    {
      id: 'mulebuy',
      name: 'Mulebuy',
      feePercent: 0,
      shipping: '$8-15',
      builder: (pid, _p) =>
        `https://mulebuy.com/product/?shop_type=${platform === 'weidian' ? 'weidian' : 'link'}&id=${pid}&ref=200642502`,
    },
    {
      id: 'joyagoo',
      name: 'Joyagoo',
      feePercent: 5,
      shipping: '$10-18',
      builder: (pid, p) =>
        `https://joyagoo.com/product?platform=${p === 'WD' ? 'WEIDIAN' : p === 'TB' ? 'TAOBAO' : 'ALI1688'}&id=${pid}&ref=300768147`,
    },
    {
      id: 'usfans',
      name: 'USFans',
      feePercent: 6,
      shipping: '$10-18',
      builder: (pid, _p) =>
        `https://www.usfans.com/product/3/${pid}?ref=RCGD5YSI`,
    },
    {
      id: 'hipobuy',
      name: 'Hipobuy',
      feePercent: 5,
      shipping: '$10-18',
      builder: (pid, p) =>
        `https://hipobuy.com/product/${p === 'WD' ? 'weidian' : p === 'TB' ? 'taobao' : '1688'}/${pid}?inviteCode=YZKOGE9NE`,
    },
    {
      id: 'litbuy',
      name: 'Litbuy',
      feePercent: 5,
      shipping: '$10-18',
      builder: (pid, p) =>
        `https://oopbuy.com/product/${p === 'WD' ? 'weidian' : p === 'TB' ? 'taobao' : '1688'}/${pid}?inviteCode=GH40R4J0O`,
    },
    {
      id: 'oopbuy',
      name: 'OopBuy',
      feePercent: 5,
      shipping: '$10-18',
      builder: (pid, p) =>
        `https://oopbuy.com/product/${p === 'WD' ? 'weidian' : p === 'TB' ? 'taobao' : '1688'}/${pid}?inviteCode=GH40R4J0O`,
    },
    {
      id: 'acbuy',
      name: 'ACBuy',
      feePercent: 5,
      shipping: '$10-18',
      builder: (pid, p) =>
        `https://www.acbuy.com/product?id=${pid}&u=UD3WIU&source=${p}`,
    },
    {
      id: 'allchinabuy',
      name: 'AllChinaBuy',
      feePercent: 8,
      shipping: '$12-20',
      builder: (pid, _p) =>
        `https://www.allchinabuy.com/product/index?id=${pid}&ref=REPSFINDER`,
    },
    {
      id: 'superbuy',
      name: 'Superbuy',
      feePercent: 10,
      shipping: '$15-25',
      builder: (pid, p) =>
        `https://www.superbuy.com/en/page/buy/?platform=${p}&id=${pid}&partnercode=Ey3NrI`,
    },
    {
      id: 'kakobuy',
      name: 'Kakobuy',
      feePercent: 5,
      shipping: '$10-18',
      builder: (pid, _p) =>
        `https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D${pid}&affcode=hc9hzsSI`,
    },
  ];

  return agentConfigs.map((cfg) => ({
    id: cfg.id,
    name: cfg.name,
    feePercent: cfg.feePercent,
    shippingEstimate: cfg.shipping,
    buyUrl: cfg.builder(productId, plat),
    registerUrl: AGENT_REGISTER_URLS[cfg.id] || '',
    logo: '',
  }));
}

export interface AgentComparison {
  agentId: string;
  agentName: string;
  agentLogo: string;
  feePercent: number;
  productPriceUSD: number;
  serviceFeeUSD: number;
  shippingEstimate: string;
  totalMin: number;
  totalMax: number;
  buyUrl: string;
  registerUrl: string;
  isBestDeal: boolean;
}

export function computeAgentComparisons(
  agents: AgentLink[],
  priceCNY: number,
): AgentComparison[] {
  const USD_RATE = 0.14;
  const baseUSD = priceCNY * USD_RATE;

  const results: AgentComparison[] = agents.map((a) => {
    const serviceFee = baseUSD * (a.feePercent / 100);
    const shipMin = parseFloat(a.shippingEstimate.replace(/[^0-9.-]/g, '').split('-')[0] || '10');
    const shipMax = parseFloat(a.shippingEstimate.replace(/[^0-9.-]/g, '').split('-')[1] || '18');
    const totalMin = baseUSD + serviceFee + shipMin;
    const totalMax = baseUSD + serviceFee + shipMax;

    return {
      agentId: a.id,
      agentName: a.name,
      agentLogo: a.logo,
      feePercent: a.feePercent,
      productPriceUSD: baseUSD,
      serviceFeeUSD: serviceFee,
      shippingEstimate: a.shippingEstimate,
      totalMin: Math.round(totalMin * 100) / 100,
      totalMax: Math.round(totalMax * 100) / 100,
      buyUrl: a.buyUrl,
      registerUrl: a.registerUrl,
      isBestDeal: false,
    };
  });

  results.sort((a, b) => a.totalMin - b.totalMin);

  if (results.length > 0) {
    results[0].isBestDeal = true;
  }

  return results;
}
