import { useState } from "react";
import { addDoc, collection, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem, PaymentType } from "@/types/order";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useCart } from "@/hooks/useCart";
import { FiLoader } from "react-icons/fi";

interface CheckoutFormProps {
    cartItems: CartItem[];
}

export default function CheckoutForm({ cartItems }: CheckoutFormProps) {
    const { removeFromCart } = useCart();
    const { user, userData } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        clientName: userData?.name || "",
        paymentMethod: "dinheiro" as PaymentType
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        clientName: ""
    });

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            clientName: ""
        };

        if (!user) {
            if (!formData.clientName.trim()) {
                newErrors.clientName = "Nome é obrigatório";
                valid = false;
            } else if (formData.clientName.length < 3) {
                newErrors.clientName = "Nome muito curto";
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
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
                    alert(`Produto \"${item.name}\" não possui estoque suficiente. Estoque: ${productData.stock}`);
                    setLoading(false);
                    return;
                }
            }

            // Busca a cantina ativa SEMPRE
            const pixDoc = await getDoc(doc(db, 'pixConfig', 'current'));
            const actualPixConfig = pixDoc.exists() ? pixDoc.data() : null;
            const cantinaId = actualPixConfig?.current || 'indefinido';

            // Se for PIX, busca os dados da cantina atual
            let pixDetails = null;
            if (formData.paymentMethod === "pix") {
                const pixData = await getDoc(doc(db, 'pixConfig', cantinaId));
                pixDetails = pixData.exists() ? pixData.data() : null;
                if (!pixDetails) {
                    setLoading(false);
                    return;
                }
            }

            // Cria o pedido no Firestore
            const orderData = {
                clientName: formData.clientName.trim(),
                clientWhatsApp: user ? userData?.telephone || "" : "",
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                paymentMethod: formData.paymentMethod,
                selectedPix: pixDetails,
                status: "pendente",
                createdAt: Timestamp.now(),
                userId: user?.uid || null, // Adiciona o ID do usuário se estiver logado
                cantinaId, // Adiciona o ID da cantina ativa
            };
            const orderRef = await addDoc(collection(db, "orders"), orderData);
            // Atualiza o pedido com o orderId
            await updateDoc(orderRef, { orderId: orderRef.id });

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
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Pagamento e Informações</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!user && (
                    <div>
                        <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 mb-1">
                            Nome Completo <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="clientName"
                            type="text"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className={`w-full p-3 border rounded-lg transition-colors ${errors.clientName ? "border-rose-400 focus:ring-rose-500" : "border-slate-300 focus:border-sky-500 focus:ring-sky-500"} focus:outline-none focus:ring-2`}
                            placeholder="Seu nome completo"
                            required
                            minLength={3}
                        />
                        {errors.clientName && (
                            <p className="text-rose-600 text-xs mt-1">{errors.clientName}</p>
                        )}
                    </div>
                )}

                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 mb-1">
                        Método de Pagamento <span className="text-rose-500">*</span>
                    </label>
                    <select
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentType })}
                        className="w-full font-medium text-black p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-sky-500 focus:ring-sky-500"
                        required
                    >
                        <option value="dinheiro">💵 Dinheiro</option>
                        <option value="pix">💸 Pix</option>
                        <option value="credito">💳 Cartão de Crédito</option>
                        <option value="debito">💳 Cartão de Débito</option>
                    </select>
                    {formData.paymentMethod === "pix" && (
                        <p className="text-xs text-slate-500 mt-2 p-2 bg-sky-50 rounded-md">
                            Você receberá as informações para pagamento via PIX na página de sucesso.
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-4 text-white rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"}`}
                >
                    {loading ? (
                        <>
                            <FiLoader className="animate-spin" size={24} />
                            <span>Processando...</span>
                        </>
                    ) : (
                        "Confirmar e Finalizar Pedido"
                    )}
                </button>
            </form>
        </div>
    );
}