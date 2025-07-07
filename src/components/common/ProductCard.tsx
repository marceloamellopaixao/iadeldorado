import { Product } from "@/types/product";
import { FiShoppingCart, FiCheckCircle, FiSlash } from 'react-icons/fi';

interface ProductCardProps {
    product: Product;
    onAddToCart: () => void;
    isInCart: boolean;
}

export function ProductCard({ product, onAddToCart, isInCart }: ProductCardProps) {
    const isOutOfStock = product.stock <= 0;

    // Estilo base do botão
    const buttonBaseStyle = "w-full mt-4 py-2.5 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-white transform hover:scale-105";

    // Estilos condicionais do botão
    const buttonStyles = isOutOfStock
        ? "bg-slate-300 text-slate-500 cursor-not-allowed" // Sem estoque
        : isInCart
            ? "bg-teal-500" // No carrinho (cor de sucesso)
            : "bg-sky-600 hover:bg-sky-500"; // Padrão (Adicionar)

    return (
        <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-md p-4 justify-between transition-shadow duration-300 hover:shadow-xl">
            {/* Seção de Informações do Produto */}
            <div className="flex-grow">
                <h3 className="text-slate-800 text-lg font-bold mb-2">{product.name}</h3>
                {/* Container com altura fixa para alinhar os cards */}
                <div className="h-14 mb-4">
                    <p className="text-slate-500 text-sm">{product.description || "Este produto não possui descrição."}</p>
                </div>
            </div>

            {/* Seção de Preço e Estoque */}
            <div className="mb-2">
                <p className="text-slate-800 font-black text-xl mb-1">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                <p className={`text-sm font-semibold ${isOutOfStock ? 'text-rose-500' : 'text-green-600'}`}>
                    {isOutOfStock ? 'Produto indisponível' : `Em estoque: ${product.stock}`}
                </p>
            </div>

            {/* Botão de Ação */}
            <button
                onClick={onAddToCart}
                disabled={isOutOfStock}
                className={`${buttonBaseStyle} ${buttonStyles}`}
            >
                {isOutOfStock ? (
                    <>
                        <FiSlash size={20} />
                        <span>Indisponível</span>
                    </>
                ) : isInCart ? (
                    <>
                        <FiCheckCircle size={20} />
                        <span>Adicionado</span>
                    </>
                ) : (
                    <>
                        <FiShoppingCart size={20} />
                        <span>Adicionar ao Carrinho</span>
                    </>
                )}
            </button>
        </div>
    );
}