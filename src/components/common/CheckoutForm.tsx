import { useState } from "react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem, PaymentType } from "@/types/order";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useCart } from "@/hooks/useCart";

interface CheckoutFormProps {
    cartItems: CartItem[];
}

export default function CheckoutForm({ cartItems }: CheckoutFormProps) {
    const { removeFromCart } = useCart();
    const { user, userData } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        clientName: userData?.name || "",
        clientWhatsApp: userData?.telephone || "",
        paymentMethod: "dinheiro" as PaymentType
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        clientName: "",
        clientWhatsApp: ""
    });

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            clientName: "",
            clientWhatsApp: ""
        };

        if (!user) {
            if (!formData.clientName.trim()) {
                newErrors.clientName = "Nome é obrigatório";
                valid = false;
            } else if (formData.clientName.length < 3) {
                newErrors.clientName = "Nome muito curto";
                valid = false;
            }

            if (!formData.clientWhatsApp.trim()) {
                newErrors.clientWhatsApp = "WhatsApp é obrigatório";
                valid = false;
            } else if (!/^\d{11}$/.test(formData.clientWhatsApp.replace(/\D/g, ""))) {
                newErrors.clientWhatsApp = "WhatsApp inválido (11 dígitos com DDD)";
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove todos os caracteres não numéricos
        const numericValue = e.target.value.replace(/\D/g, "");

        // Limita a 11 caracteres (DDD + número)
        const formattedValue = numericValue.slice(0, 11);

        setFormData({
            ...formData,
            clientWhatsApp: formattedValue
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Verificação de estoque antes de continuar
            for (const item of cartItems) {
                const productRef = doc(db, "products", item.id);
                const productDoc = await getDoc(productRef);

                if (!productDoc.exists()) {
                    alert(`Produto ${item.name} não encontrado.`);
                    setLoading(false);
                    return;
                }

                const productData = productDoc.data();
                if (productData.stock < item.quantity) {
                    alert(`Produto "${item.name}" não possui estoque suficiente. Estoque: ${productData.stock}`);
                    setLoading(false);
                    return;
                }
            }

            // Formata o número de WhatsApp
            const formattedWhatsApp = formData.clientWhatsApp.replace(/\D/g, "");

            // Se for PIX, busca os dados da cantina atual
            let pixDetails = null;
            if (formData.paymentMethod === "pix") {
                const pixDoc = await getDoc(doc(db, 'pixConfig', 'current'));
                const actualPixConfig = pixDoc.exists() ? pixDoc.data() : null;
                const pixData = await getDoc(doc(db, 'pixConfig', actualPixConfig?.current));
                pixDetails = pixData.exists() ? pixData.data() : null;
                if (!pixDetails) {
                    setLoading(false);
                    return;
                }

            }

            // Cria o pedido no Firestore
            const orderRef = await addDoc(collection(db, "orders"), {
                clientName: formData.clientName.trim(),
                clientWhatsApp: formattedWhatsApp,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                paymentMethod: formData.paymentMethod,
                selectedPix: pixDetails,
                status: "pendente",
                createdAt: new Date(),
                userId: user?.uid || null, // Adiciona o ID do usuário se estiver logado
            });

            // Atualiza o estoque dos produtos
            for (const item of cartItems) {
                const productRef = doc(db, "products", item.id);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                    const productData = productDoc.data();
                    if (productData && productData.stock) {
                        await updateDoc(productRef, {
                            stock: productData.stock - item.quantity
                        });
                    }
                }
            }

            if (!user) {
                localStorage.setItem('lastOrderId', orderRef.id); // Armazena o ID do pedido no localStorage
                localStorage.setItem('lastOrderPhone', formData.clientWhatsApp.replace(/\D/g, ""));
            }

            if (user) {
                localStorage.removeItem('lastOrderId'); // Remove o ID do pedido do localStorage se o usuário estiver logado
                localStorage.removeItem('lastOrderPhone'); // Remove o telefone do pedido do localStorage se o usuário estiver logado
                localStorage.removeItem('tempCart'); // Remove o carrinho temporário do localStorage se o usuário estiver logado
            }

            // Remove os itens do carrinho após o pedido ser criado
            cartItems.forEach(item => {
                removeFromCart(item.id);
            });

            // Redireciona para a página de confirmação com o ID do pedido
            router.push(`/success?orderId=${orderRef.id}`);
        } catch (error) {
            console.error("Erro ao finalizar o pedido: ", error);
            alert("Ocorreu um erro ao finalizar o pedido. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {!user && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-white-700 mb-1">
                            Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className={`w-full p-2 border rounded ${errors.clientName ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Exemplo: Marcelo Augusto"
                            required
                            minLength={3}
                        />
                        {errors.clientName && (
                            <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white-700 mb-1">
                            WhatsApp (com DDD) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.clientWhatsApp}
                            onChange={handleWhatsAppChange}
                            className={`w-full p-2 border rounded ${errors.clientWhatsApp ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Exemplo: 11912345678"
                            required
                            pattern="\d{11}"
                            maxLength={11}
                        />
                        {errors.clientWhatsApp && (
                            <p className="text-red-500 text-xs mt-1">{errors.clientWhatsApp}</p>
                        )}
                        <p className="text-xs text-white-500 mt-1">
                            Digite apenas números (DDD + número)
                        </p>
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-white-700 mb-1">
                    Método de Pagamento <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentType })}
                    className="w-full font-bold p-2 border border-gray-300 rounded"
                    required
                >
                    <option className="text-black" value="dinheiro">💵Dinheiro</option>
                    <option className="text-black" value="pix">💸Pix</option>
                    <option className="text-black" value="credito">💳Cartão de Crédito</option>
                    <option className="text-black" value="debito">💳Cartão de Débito</option>
                </select>

                {formData.paymentMethod === "pix" && (
                    <p className="text-xs text-white-500 mt-1">
                        Você receberá as informações para pagamento via PIX após confirmar o pedido.
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full p-3 text-white bg-blue-600 rounded-lg font-medium ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    } transition-colors`}
            >
                {loading ? (
                    "Processando Pedido..."
                ) : (
                    "Finalizar Pedido"
                )}
            </button>
        </form>
    );
}