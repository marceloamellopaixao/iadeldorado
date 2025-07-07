import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { FiShoppingCart, FiSlash, FiMinus, FiPlus } from 'react-icons/fi';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void; 
    isInCart: boolean;
    // NOVA PROPRIEDADE: informa quantos deste item já estão no carrinho.
    quantityInCart: number; 
}

export function ProductCard({ product, onAddToCart, isInCart, quantityInCart }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);

    // Lógica de estoque corrigida.
    const availableStock = product.stock - quantityInCart;
    const canAddToCart = availableStock > 0;

    // Efeito para resetar ou ajustar a quantidade local se o estoque disponível mudar.
    useEffect(() => {
        // Garante que a quantidade selecionada nunca seja maior que o estoque disponível.
        if (quantity > availableStock) {
            setQuantity(Math.max(1, availableStock));
        }
        // Se, por alguma razão, o card iniciar com 0 disponível, seta a quantidade para 1 (mas o botão estará desabilitado).
        if (availableStock <= 0) {
            setQuantity(1);
        }
    }, [availableStock, quantity]);


    const handleDecrement = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const handleIncrement = () => {
        // Limita o incremento ao estoque REALMENTE disponível.
        setQuantity((prev) => Math.min(prev + 1, availableStock));
    };

    const buttonBaseStyle = "w-full mt-4 py-2.5 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-white transform hover:scale-105";

    const buttonStyles = !canAddToCart
        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
        : "bg-sky-600 hover:bg-sky-500";

    return (
        <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-md p-4 justify-between transition-shadow duration-300 hover:shadow-xl">
            <div className="flex-grow">
                <h3 className="text-slate-800 text-lg font-bold mb-2">{product.name}</h3>
                <div className="h-14 mb-4">
                    <p className="text-slate-500 text-sm">{product.description || "Este produto não possui descrição."}</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-slate-800 font-black text-xl mb-1">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                {/* A mensagem de estoque agora considera o que já está no carrinho */}
                <p className={`text-sm font-semibold ${!canAddToCart ? 'text-rose-500' : 'text-green-600'}`}>
                    {product.stock <= 0 ? 'Produto esgotado' :
                     !canAddToCart ? 'Você já adicionou todo o estoque' :
                     `Disponível: ${availableStock}`}
                </p>
            </div>

            {/* Seletor de Quantidade */}
            <div className="flex items-center justify-center gap-4 mb-2">
                <button 
                    onClick={handleDecrement} 
                    disabled={!canAddToCart || quantity <= 1}
                    className="p-2 bg-slate-200 rounded-full text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FiMinus size={16} />
                </button>
                <span className="text-xl font-bold text-slate-800 w-8 text-center">
                    {canAddToCart ? quantity : <FiSlash />}
                </span>
                <button 
                    onClick={handleIncrement} 
                    disabled={!canAddToCart || quantity >= availableStock}
                    className="p-2 bg-slate-200 rounded-full text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FiPlus size={16} />
                </button>
            </div>

            {/* Botão de Ação Principal */}
            <button
                onClick={() => onAddToCart(product, quantity)}
                disabled={!canAddToCart}
                className={`${buttonBaseStyle} ${buttonStyles}`}
            >
                {!canAddToCart ? (
                    <>
                        <FiSlash size={20} />
                        <span>Indisponível</span>
                    </>
                ) : isInCart ? (
                    <>
                        <FiPlus size={20} />
                        <span>Adicionar mais {quantity}</span>
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