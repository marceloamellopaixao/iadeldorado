import { Product } from "@/types/product";
import Image from "next/image";
import noStockIcon from "@/assets/icons/ban-solid.svg"
import addCartIcon from "@/assets/icons/cart-plus-solid.svg"
import itemCartIcon from "@/assets/icons/thumbs-up-regular.svg"

interface ProductCardProps {
    product: Product;  // Objeto do tipo Product que contém as informações do produto
    onAddToCart: () => void; // Função chamada ao adicionar o produto ao carrinho
    isInCart: boolean; // Indica se o produto está no carrinho
}

export function ProductCard({ product, onAddToCart, isInCart }: ProductCardProps) {

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg p-4 flex flex-col justify-between h-full transition hover:scale-105 hover:shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-2">{product.name}</h3>
            {/* <div className="relative w-full h-48 mb-4">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                />
            </div> */}
            <p className="text-zinc-400 text-sm mb-4">{product.description}</p>
            <p className="text-white font-bold text-lg mb-4">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            <button
                onClick={onAddToCart}
                disabled={product.stock <= 0}
                className={`w-full mt-4 py-2 rounded ${product.stock <= 0
                    ? 'bg-gray-400 text-white font-bold cursor-not-allowed'
                    : isInCart
                        ? 'bg-green-500 text-white font-bold'
                        : 'bg-blue-500 text-white font-bold hover:bg-blue-600'
                    }`}
            >
                {product.stock <= 0 ? (
                    <div className="flex items-center justify-center">
                        <Image src={noStockIcon} alt="Sem Estoque" width={20} height={20} />
                        <span className="ml-2">Sem Estoque</span>
                    </div>
                ) : isInCart ? (
                    <div className="flex items-center justify-center">
                        <Image src={itemCartIcon} alt="Produto no Carrinho" width={20} height={20} />
                        <span className="ml-2">Produto no Carrinho</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <Image src={addCartIcon} alt="Adicionar no Carrinho" width={20} height={20} />
                        <span className="ml-2">Adicionar no Carrinho</span>
                    </div>
                )}
            </button>
        </div>
    );
}