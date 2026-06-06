export interface Product {
  id: string;
  name: string;
  nombre?: string;
  price?: number;
  originalPrice?: number;
  precio?: number;
  image?: string;
  images?: string[];
  foto?: string;
  foto1?: string;
  foto2?: string;
  foto3?: string;
  foto4?: string;
  foto5?: string;
  foto6?: string;
  fotos?: string[];
  store?: string;
  url?: string;
  category?: string;
  categoria?: string;
  rating?: number;
  reviews?: number;
  ventas?: number;
  marca?: string;
  fecha?: string;
  linkWeidian?: string;
  linkKakobuy?: string;
  linkUsfans?: string;
  linkMulebuy?: string;
  linkJoyagoo?: string;
  linkOppbuy?: string;
  linkLitbuy?: string;
  linkHipobuy?: string;
  linkSuperbuy?: string;
  linkAcbuy?: string;
  descripcion?: string;
  descripcionEn?: string;
  activo?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  image?: string;
  logo?: string;
  rating?: number;
  sales?: number;
  reviews?: number;
  verified?: boolean;
  badge?: string;
  founded?: string;
  shippingTime?: string;
  qcSuccess?: string | number;
  shippingCost?: string;
  commission?: string;
  storage?: string;
  recommendation?: string;
  pros?: string;
  cons?: string;
  register?: string;
  bonus?: string;
  costoEnvio?: string;
  diasEnvio?: string;
  trustpilot?: {
    rating?: number;
    reviews?: number;
    url?: string;
  };
  description?: string;
}

export interface ProductBadge {
  type: 'verified' | 'new' | 'sale' | 'popular' | 'best_seller';
  label: string;
}

export interface GoogleSheetData {
  agents?: Agent[];
  products?: Product[];
  table?: any;
}

export const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  CNY: 7.2,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  CNY: '¥',
};
