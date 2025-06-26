export interface StripeProduct {
  id: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'starter',
    monthlyPriceId: 'price_1RY6fOBTJG4VGXggqEnGb9AC',
    yearlyPriceId: 'price_1RY79vBTJG4VGXggb0jIuSlb',
    name: 'Starter',
    description: 'Ideal para pequenos negócios e profissionais',
    mode: 'subscription',
    monthlyPrice: 99.00,
    yearlyPrice: 950.40,
    currency: 'usd'
  },
  {
    id: 'pro',
    monthlyPriceId: 'price_1RYCNsBTJG4VGXggJZpwo0p2',
    yearlyPriceId: 'price_1RYCX2BTJG4VGXggJcMOpUlJ',
    name: 'Pro',
    description: 'Perfeito para empresas em crescimento',
    mode: 'subscription',
    monthlyPrice: 299.00,
    yearlyPrice: 2870.40,
    currency: 'usd'
  },
  {
    id: 'enterprise',
    monthlyPriceId: 'price_1RYCayBTJG4VGXggawM974zG',
    yearlyPriceId: 'price_1RYCeYBTJG4VGXggpVTc34Qv',
    name: 'Enterprise',
    description: 'Para grandes empresas com necessidades específicas',
    mode: 'subscription',
    monthlyPrice: 499.00,
    yearlyPrice: 4790.40,
    currency: 'usd'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => 
    product.monthlyPriceId === priceId || product.yearlyPriceId === priceId
  );
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};