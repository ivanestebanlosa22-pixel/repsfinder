// ==================== CENTRALIZED AGENT LINK GENERATOR ====================
// Single source of truth for generating agent purchase links

export interface AgentLinks {
  kakobuy: string;
  usfans: string;
  mulebuy: string;
  joyagoo: string;
  oppbuy: string;
  litbuy: string;
  hipobuy: string;
  superbuy: string;
  acbuy: string;
}

/**
 * Extracts product ID from a Weidian URL
 */
export const extractProductId = (weidianUrl: string): string | null => {
  if (!weidianUrl) return null;
  const match = weidianUrl.match(/itemID[=:](\d+)/) || weidianUrl.match(/\/(\d+)(?:\?|$)/);
  return match ? match[1] : null;
};

/**
 * Generates purchase links for all supported agents from a Weidian URL
 */
export const generateAgentLinks = (weidianUrl: string): AgentLinks | null => {
  const productId = extractProductId(weidianUrl);
  if (!productId) return null;

  return {
    kakobuy: `https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D${productId}&affcode=hc9hzsSI`,
    usfans: `https://www.usfans.com/product/3/${productId}?ref=RCGD5YSI`,
    mulebuy: `https://mulebuy.com/product/?shop_type=weidian&id=${productId}&ref=200642502`,
    joyagoo: `https://joyagoo.com/product?platform=WEIDIAN&id=${productId}&ref=300768147`,
    oppbuy: `https://oopbuy.com/product/weidian/${productId}?inviteCode=GH40R4J0O`,
    litbuy: `https://litbuy.net/product/weidian/${productId}?inviteCode=YBMHFG55L`,
    hipobuy: `https://hipobuy.com/product/weidian/${productId}?inviteCode=YZKOGE9NE`,
    superbuy: `https://www.superbuy.com/en/page/buy/?platform=WD&id=${productId}&partnercode=Ey3NrI`,
    acbuy: `https://www.acbuy.com/product?id=${productId}&u=UD3WIU&source=WD`,
  };
};
