// Product types and data
export type Product = {
  id: string
  sku: string
  title: string
  variant: string
  price_cad: number
  image: string
  url: string
  category?: string
}

// Sample products - replace with your actual product data
export const products: Product[] = [
  {
    id: "molle-pda-mc-cp",
    sku: "MOLLE-PDA-001",
    title: "MOLLE PDA Phone Panel",
    variant: "MC Camo / CP Camo",
    price_cad: 24.99,
    image: "/images/mollepda-mc-cp.png",
    url: "https://item.taobao.com/item.htm?id=713575933395",
    category: "Pouches"
  },
  {
    id: "molle-pda-bcp",
    sku: "MOLLE-PDA-002",
    title: "MOLLE PDA Phone Panel",
    variant: "Dark Night Camo BCP",
    price_cad: 24.99,
    image: "/images/mollepda--bcp.png",
    url: "https://item.taobao.com/item.htm?id=713575933395",
    category: "Pouches"
  },
  {
    id: "molle-pda-bk",
    sku: "MOLLE-PDA-003",
    title: "MOLLE PDA Phone Panel",
    variant: "Black BK",
    price_cad: 24.99,
    image: "/images/mollepda--bk.png",
    url: "https://item.taobao.com/item.htm?id=713575933395",
    category: "Pouches"
  },
  {
    id: "m67-grenade-16",
    sku: "M67-GRN-001",
    title: "M67 Toy Grenade Set",
    variant: "16 Grenades + Airdrop Box",
    price_cad: 49.99,
    image: "/images/m67-16.png",
    url: "https://detail.tmall.com/item.htm?id=823946437927",
    category: "Grenades"
  },
  {
    id: "m67-grenade-8-green",
    sku: "M67-GRN-002",
    title: "M67 Toy Grenade Set",
    variant: "8 Grenades + Airdrop Box Green",
    price_cad: 34.99,
    image: "/images/m67-8-.png",
    url: "https://detail.tmall.com/item.htm?id=823946437927",
    category: "Grenades"
  },
  {
    id: "m26-green",
    sku: "M26-GRN-001",
    title: "M26 Reusable Grenade",
    variant: "Military Green",
    price_cad: 19.99,
    image: "/images/m67-m26.png",
    url: "https://detail.tmall.com/item.htm?id=823946437927",
    category: "Grenades"
  },
]

// Get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

// Get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category)
}

// Get featured products (first 3 for homepage)
export function getFeaturedProducts(count: number = 3): Product[] {
  return products.slice(0, count)
}
