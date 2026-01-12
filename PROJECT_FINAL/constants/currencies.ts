// Sistema de monedas - RepsFinder PRO

export type Currency = 'USD' | 'EUR';

export const EXCHANGE_RATE_USD_TO_EUR = 0.92; // Actualizar periódicamente

export const convertPrice = (price: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return price;
  
  if (fromCurrency === 'USD' && toCurrency === 'EUR') {
    return price * EXCHANGE_RATE_USD_TO_EUR;
  }
  
  if (fromCurrency === 'EUR' && toCurrency === 'USD') {
    return price / EXCHANGE_RATE_USD_TO_EUR;
  }
  
  return price;
};

export const formatPrice = (price: number, currency: Currency): string => {
  const symbol = currency === 'USD' ? '$' : '€';
  const formatted = price.toFixed(2);
  return currency === 'EUR' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
};

export const getCurrencySymbol = (currency: Currency): string => {
  return currency === 'USD' ? '$' : '€';
}
