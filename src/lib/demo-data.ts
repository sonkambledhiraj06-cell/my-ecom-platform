import { createClient } from "@/lib/supabase/client";

export interface DemoProduct {
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  selling_price: number;
  mrp: number;
  discount: number;
  cost_cogs: number;
  stock_level: number;
  low_stock: number;
  features: string[];
  benefits: string[];
  usp: string;
  image_url: string;
  status: string;
  is_demo: boolean;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: "AeroRun Pro Running Shoes",
    sku: "DEMO-SHOE-001",
    category: "Running Shoes",
    brand: "AeroRun",
    description: "Lightweight performance running shoes engineered for speed and comfort. Features responsive cushioning and breathable mesh upper for all-day wear.",
    selling_price: 2499,
    mrp: 3999,
    discount: 37.5,
    cost_cogs: 1200,
    stock_level: 24,
    low_stock: 5,
    features: [
      "Responsive AirFoam midsole cushioning",
      "Breathable engineered mesh upper",
      "Rubber outsole with traction pattern",
      "Lightweight at just 280g per shoe",
      "Padded collar and tongue for comfort"
    ],
    benefits: [
      "Reduces impact on joints during runs",
      "Keeps feet cool and dry",
      "Improves running efficiency",
      "All-day comfort for training and casual wear"
    ],
    usp: "Professional-grade running performance at an unbeatable price — same technology used by marathon runners, now accessible to every fitness enthusiast.",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "PulseTrack Smart Watch",
    sku: "DEMO-WATCH-001",
    category: "Smart Watch",
    brand: "PulseTrack",
    description: "Advanced fitness smartwatch with heart rate monitoring, GPS tracking, and 7-day battery life. Your complete health and fitness companion.",
    selling_price: 4999,
    mrp: 7999,
    discount: 37.5,
    cost_cogs: 2200,
    stock_level: 18,
    low_stock: 5,
    features: [
      "1.43\" AMOLED always-on display",
      "Continuous heart rate monitoring",
      "Built-in GPS with route tracking",
      "7-day battery life on single charge",
      "Water resistant to 5ATM",
      "100+ workout modes"
    ],
    benefits: [
      "Track your fitness progress in real-time",
      "Monitor heart health 24/7",
      "Never miss important notifications",
      "Swim-proof design for active lifestyles"
    ],
    usp: "The only smartwatch under ₹5000 with medical-grade heart rate sensor and 7-day battery — no daily charging needed.",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "CottonSoft Premium T-Shirt",
    sku: "DEMO-TSHIRT-001",
    category: "Premium T-Shirt",
    brand: "CottonSoft",
    description: "Ultra-soft 100% combed cotton premium t-shirt with a modern relaxed fit. Pre-shrunk fabric ensures lasting comfort wash after wash.",
    selling_price: 799,
    mrp: 1299,
    discount: 38.5,
    cost_cogs: 320,
    stock_level: 50,
    low_stock: 10,
    features: [
      "100% combed cotton 180 GSM",
      "Pre-shrunk and bio-washed fabric",
      "Reinforced collar that stays in shape",
      "Side-seamed construction for better fit",
      "Available in 12 colors"
    ],
    benefits: [
      "Incredibly soft against skin",
      "Maintains shape and color after multiple washes",
      "Breathable for all-day comfort",
      "Versatile for casual and semi-casual occasions"
    ],
    usp: "Premium quality at high-street prices — the same fabric quality used by international brands, now at 40% less.",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "SoundBurst Wireless Earbuds",
    sku: "DEMO-EARBUDS-001",
    category: "Wireless Earbuds",
    brand: "SoundBurst",
    description: "True wireless earbuds with active noise cancellation, 36-hour total battery life, and crystal-clear calls. Premium sound for music lovers.",
    selling_price: 1999,
    mrp: 3499,
    discount: 42.9,
    cost_cogs: 850,
    stock_level: 35,
    low_stock: 8,
    features: [
      "Active Noise Cancellation (ANC)",
      "36 hours total battery life",
      "Bluetooth 5.3 with instant pairing",
      "IPX5 water and sweat resistant",
      "Touch controls for music and calls",
      "Dual microphones with noise reduction"
    ],
    benefits: [
      "Immersive sound without distractions",
      "All-day battery for music and calls",
      "Perfect for workouts and commuting",
      "Crystal clear voice calls even in noise"
    ],
    usp: "Premium ANC earbuds at a fraction of the cost — same technology as brands charging 3x more, with better battery life.",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "HydroFlask Steel Bottle",
    sku: "DEMO-BOTTLE-001",
    category: "Stainless Steel Bottle",
    brand: "HydroFlask",
    description: "Double-wall vacuum insulated stainless steel bottle that keeps drinks hot for 12 hours or cold for 24 hours. BPA-free and leak-proof.",
    selling_price: 899,
    mrp: 1499,
    discount: 40,
    cost_cogs: 380,
    stock_level: 42,
    low_stock: 10,
    features: [
      "Double-wall vacuum insulation",
      "Keeps hot 12 hours, cold 24 hours",
      "18/8 food-grade stainless steel",
      "BPA-free and non-toxic",
      "Leak-proof lid with carry handle",
      "750ml capacity"
    ],
    benefits: [
      "Perfect temperature drinks all day",
      "No condensation or sweat on outside",
      "Eco-friendly alternative to plastic",
      "Dent-resistant and long lasting"
    ],
    usp: "Laboratory-grade insulation at an everyday price — outperforms bottles costing twice as much in independent temperature tests.",
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "UrbanTrek Pro Backpack",
    sku: "DEMO-BACKPACK-001",
    category: "Backpack",
    brand: "UrbanTrek",
    description: "Water-resistant laptop backpack with anti-theft design, USB charging port, and 25L capacity. Built for professionals and travelers.",
    selling_price: 1799,
    mrp: 2999,
    discount: 40,
    cost_cogs: 750,
    stock_level: 20,
    low_stock: 5,
    features: [
      "Water-resistant polyester fabric",
      "Fits up to 15.6\" laptops",
      "Anti-theft hidden back pocket",
      "Built-in USB charging port",
      "25L capacity with 8 compartments",
      "Padded breathable back panel"
    ],
    benefits: [
      "Protects laptop and valuables",
      "Organized storage for daily essentials",
      "Charge devices on the go",
      "Comfortable for all-day carry"
    ],
    usp: "Travel-tested security features at commuter prices — the anti-theft design and charging port usually found only in premium backpacks.",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "ShadeMaster Polarized Sunglasses",
    sku: "DEMO-SUNGLASSES-001",
    category: "Sunglasses",
    brand: "ShadeMaster",
    description: "Premium polarized sunglasses with UV400 protection, lightweight titanium frame, and anti-reflective coating. Style meets protection.",
    selling_price: 1299,
    mrp: 2499,
    discount: 48,
    cost_cogs: 520,
    stock_level: 30,
    low_stock: 8,
    features: [
      "100% UV400 polarized lenses",
      "Lightweight titanium frame",
      "Anti-reflective coating",
      "Scratch-resistant lenses",
      "Includes premium carrying case",
      "Available in 4 frame colors"
    ],
    benefits: [
      "Eliminates 99% of glare",
      "Protects eyes from harmful UV rays",
      "Featherlight comfort all day",
      "Reduces eye strain while driving"
    ],
    usp: "Luxury titanium frame with polarization tech at high-street prices — the same materials used in sunglasses 4x the price.",
    image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "FitPulse Fitness Band",
    sku: "DEMO-FITNESS-001",
    category: "Fitness Band",
    brand: "FitPulse",
    description: "Slim fitness tracker with SpO2 monitoring, sleep tracking, and 14-day battery life. Stay on top of your health goals effortlessly.",
    selling_price: 1499,
    mrp: 2499,
    discount: 40,
    cost_cogs: 650,
    stock_level: 45,
    low_stock: 10,
    features: [
      "SpO2 blood oxygen monitoring",
      "24/7 heart rate tracking",
      "Advanced sleep quality analysis",
      "14-day battery life",
      "1.1\" color TFT display",
      "13 workout modes"
    ],
    benefits: [
      "Monitor your health metrics daily",
      "Improve sleep with actionable insights",
      "Track calories and activity goals",
      "Lightweight and comfortable for 24/7 wear"
    ],
    usp: "Medical-grade SpO2 and heart tracking in a slim band — features typically only available in full smartwatches, at half the price.",
    image_url: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "StreetFlex Casual Sneakers",
    sku: "DEMO-SNEAKERS-001",
    category: "Casual Sneakers",
    brand: "StreetFlex",
    description: "Trendy everyday sneakers with memory foam insole and canvas upper. The perfect blend of style and comfort for daily wear.",
    selling_price: 1699,
    mrp: 2799,
    discount: 39.3,
    cost_cogs: 700,
    stock_level: 28,
    low_stock: 7,
    features: [
      "Memory foam cushioned insole",
      "Premium canvas upper",
      "Vulcanized rubber outsole",
      "Padded ankle collar",
      "Breathable inner lining",
      "Available in 6 colorways"
    ],
    benefits: [
      "Cloud-like comfort with every step",
      "Pairs well with any casual outfit",
      "Durable construction for daily use",
      "Easy to clean and maintain"
    ],
    usp: "Memory foam comfort technology in a street-style silhouette — the same comfort as running shoes, in a look that goes with everything.",
    image_url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
  {
    name: "ComfortWear Premium Hoodie",
    sku: "DEMO-HOODIE-001",
    category: "Hoodie",
    brand: "ComfortWear",
    description: "Heavyweight fleece hoodie with kangaroo pocket, adjustable drawstring, and ribbed cuffs. Your go-to layer for every season.",
    selling_price: 1299,
    mrp: 2199,
    discount: 40.9,
    cost_cogs: 550,
    stock_level: 3,
    low_stock: 5,
    features: [
      "320 GSM premium fleece fabric",
      "Double-lined hood with drawstrings",
      "Large kangaroo pocket",
      "Ribbed cuffs and hem",
      "Pre-shrunk cotton blend",
      "Available in 8 colors and sizes S-XXL"
    ],
    benefits: [
      "Warmth without bulk",
      "Soft inner fleece feels great on skin",
      "Holds shape wash after wash",
      "Versatile for layering or standalone wear"
    ],
    usp: "Premium heavyweight fleece at a fair price — the same GSM and construction quality as streetwear brands charging 3x more.",
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    status: "active",
    is_demo: true,
  },
];

export async function addDemoProducts(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase = createClient();

    const { data: existingDemos } = await supabase
      .from("products")
      .select("sku")
      .eq("is_demo", true);

    if (existingDemos && existingDemos.length > 0) {
      return { success: false, count: 0, error: "Demo products already exist. Delete them first to re-add." };
    }

    const productsToInsert = DEMO_PRODUCTS.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      description: p.description,
      selling_price: p.selling_price,
      mrp: p.mrp,
      discount: p.discount,
      cost_cogs: p.cost_cogs,
      stock_level: p.stock_level,
      low_stock: p.low_stock,
      features: p.features,
      benefits: p.benefits,
      usp: p.usp,
      image_url: p.image_url,
      status: p.status,
      is_demo: true,
    }));

    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select("id");

    if (insertError) {
      return { success: false, count: 0, error: insertError.message };
    }

    if (insertedProducts && insertedProducts.length > 0) {
      const seedRecords = insertedProducts.map((product, index) => ({
        product_id: product.id,
        seed_key: DEMO_PRODUCTS[index].sku,
      }));

      await supabase.from("demo_seeds").insert(seedRecords);
    }

    return { success: true, count: insertedProducts?.length ?? 0 };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Failed to add demo products",
    };
  }
}

export async function deleteAllDemoProducts(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase = createClient();

    const { data: demoProducts, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("is_demo", true);

    if (fetchError) {
      return { success: false, count: 0, error: fetchError.message };
    }

    if (!demoProducts || demoProducts.length === 0) {
      return { success: true, count: 0 };
    }

    const demoIds = demoProducts.map((p) => p.id);

    const { error: videoError } = await supabase
      .from("product_videos")
      .delete()
      .in("product_id", demoIds);

    if (videoError) {
      console.warn("Warning cleaning up demo videos:", videoError.message);
    }

    const { error: seedError } = await supabase
      .from("demo_seeds")
      .delete()
      .in("product_id", demoIds);

    if (seedError) {
      console.warn("Warning cleaning up demo seeds:", seedError.message);
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .in("id", demoIds);

    if (deleteError) {
      return { success: false, count: 0, error: deleteError.message };
    }

    return { success: true, count: demoProducts.length };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Failed to delete demo products",
    };
  }
}

export async function getDemoProductCount(): Promise<number> {
  try {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", true);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
