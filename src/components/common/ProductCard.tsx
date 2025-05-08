import { Product } from "@/types/product";
import { useState } from "react";

interface ProductCardProps {
    product: Product;  // Objeto do tipo Product que contém as informações do produto
    onAddToCart: () => void; // Função chamada ao adicionar o produto ao carrinho
    isInCart: boolean; // Indica se o produto está no carrinho
}

export function ProductCard({ product, onAddToCart, isInCart }: ProductCardProps) {

    return (
        <div className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-gray-300 my-2">{product.description}</p>
            <p className="font-bold text-lg">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            <button
                onClick={onAddToCart}
                className={`w-full mt-4 py-2 rounded ${isInCart
                    ? 'bg-green-500 text-white font-bold'
                    : 'bg-blue-500 text-white font-bold hover:bg-blue-600'
                    }`}
            >
                {isInCart ? '✔ No Carrinho' : 'Adicionar'}
            </button>
        </div>
    );
}