export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_ST2k9F2Okd6sLr',
    priceId: 'price_1RY6fOBTJG4VGXggqEnGb9AC',
    name: 'Cloneguard',
    description: 'Advanced website cloning protection with 24/7 monitoring and automatic alerts. Recurring monthly billing to keep your site protected against unauthorized copies.',
    mode: 'subscription',
    price: 99.00,
    currency: 'usd'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};