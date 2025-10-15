"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/products"
import Image from "next/image"

type ProductCardProps = {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-muted">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{product.variant}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${product.price_cad.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">CAD</span>
        </div>
        <Button 
          onClick={() => onAddToCart(product)} 
          className="w-full gap-2"
          size="lg"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}
