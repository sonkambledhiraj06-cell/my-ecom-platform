export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  brand: string | null;
  description: string | null;
  selling_price: number | string | null;
  mrp: number | string | null;
  discount: number | string | null;
  cost_cogs: number | string | null;
  stock_level: number | string | null;
  low_stock: number | string | null;
  image_url: string | null;
  features: string[] | null;
  benefits: string[] | null;
  usp: string | null;
  status: string | null;
  is_demo: boolean;
  created_at: string;
  user_id: string | null;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  video_url: string | null;
  thumbnail_url: string | null;
  prompt: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export const numberValue = (value: number | string | null | undefined): number => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

export const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export const calculateDiscount = (price: number, mrp: number): number => {
  if (mrp <= 0 || price <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export interface AIProductScore {
  overall: number;
  content: number;
  inventory: number;
  marketing: number;
  hasDescription: boolean;
  hasFeatures: boolean;
  hasBenefits: boolean;
  hasUSP: boolean;
  hasImage: boolean;
  hasVideo: boolean;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

export function calculateProductScore(product: Product, hasVideo: boolean = false): AIProductScore {
  const hasDescription = !!product.description && product.description.trim().length > 20;
  const hasFeatures = !!product.features && product.features.length >= 3;
  const hasBenefits = !!product.benefits && product.benefits.length >= 2;
  const hasUSP = !!product.usp && product.usp.trim().length > 10;
  const hasImage = !!product.image_url;
  const stock = numberValue(product.stock_level);
  const lowThreshold = numberValue(product.low_stock) || 5;

  let contentScore = 0;
  if (hasDescription) contentScore += 25;
  if (hasFeatures) contentScore += 25;
  if (hasBenefits) contentScore += 25;
  if (hasUSP) contentScore += 25;

  let inventoryStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  let inventoryScore = 100;
  if (stock <= 0) {
    inventoryStatus = "out_of_stock";
    inventoryScore = 0;
  } else if (stock <= lowThreshold) {
    inventoryStatus = "low_stock";
    inventoryScore = 40;
  }

  let marketingScore = 0;
  if (hasImage) marketingScore += 30;
  if (hasDescription) marketingScore += 20;
  if (hasUSP) marketingScore += 20;
  if (hasVideo) marketingScore += 30;

  const overall = Math.round((contentScore * 0.4) + (inventoryScore * 0.3) + (marketingScore * 0.3));

  return {
    overall: Math.min(100, Math.max(0, overall)),
    content: contentScore,
    inventory: inventoryScore,
    marketing: marketingScore,
    hasDescription,
    hasFeatures,
    hasBenefits,
    hasUSP,
    hasImage,
    hasVideo,
    stockStatus: inventoryStatus,
  };
}

export interface BusinessHealthScore {
  overall: number;
  products: number;
  inventory: number;
  marketing: number;
  content: number;
  customers: number;
  sales: number;
}

export function calculateBusinessHealth(products: Product[], orderCount: number = 0, customerCount: number = 0): BusinessHealthScore {
  if (products.length === 0) {
    return { overall: 0, products: 0, inventory: 0, marketing: 0, content: 0, customers: 0, sales: 0 };
  }

  const productScore = Math.min(100, (products.length / 10) * 100);

  const productsWithStock = products.filter((p) => numberValue(p.stock_level) > 0).length;
  const inventoryScore = products.length > 0 ? Math.round((productsWithStock / products.length) * 100) : 0;

  const withDescription = products.filter((p) => !!p.description && p.description.length > 20).length;
  const withImages = products.filter((p) => !!p.image_url).length;
  const contentScore = products.length > 0
    ? Math.round(((withDescription / products.length) * 50) + ((withImages / products.length) * 50))
    : 0;

  const marketingScore = contentScore;

  const customerScore = Math.min(100, customerCount > 0 ? Math.round((customerCount / 10) * 100) : 0);
  const salesScore = Math.min(100, orderCount > 0 ? Math.round((orderCount / 10) * 100) : 0);

  const overall = Math.round(
    (productScore * 0.15) +
    (inventoryScore * 0.2) +
    (marketingScore * 0.2) +
    (contentScore * 0.15) +
    (customerScore * 0.15) +
    (salesScore * 0.15)
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    products: Math.round(productScore),
    inventory: inventoryScore,
    marketing: Math.round(marketingScore),
    content: Math.round(contentScore),
    customers: Math.round(customerScore),
    sales: Math.round(salesScore),
  };
}
