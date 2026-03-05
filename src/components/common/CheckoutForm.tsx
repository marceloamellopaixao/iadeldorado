import { useState } from "react";
import { addDoc, collection, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem, PaymentType } from "@/types/order";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useCart } from "@/hooks/useCart";
import { FiLoader } from "react-icons/fi";
import { calculateLineTotal } from "@/utils/pricing";

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
    const [errors, setErrors] = useState({ clientName: "" });

    const validateForm = () => {
        let valid = true;
        const newErrors = { clientName: "" };

        if (!user) {
            if (!formData.clientName.trim()) {
                newErrors.clientName = "Nome e obrigatorio";
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
        if (!validateForm()) return;

        setLoading(true);

        try {
            for (const item of cartItems) {
                const productRef = doc(db, "products", item.id);
                const productDoc = await getDoc(productRef);

                if (!productDoc.exists()) {
                    alert(`Produto ${item.name} nao encontrado.`);
                    setLoading(false);
                    return;
                }

                const productData = productDoc.data();
                if (productData.stock < item.quantity) {
                    alert(`Produto "${item.name}" nao possui estoque suficiente. Estoque: ${productData.stock}`);
                    setLoading(false);
                    return;
                }
            }

            const pixDoc = await getDoc(doc(db, "pixConfig", "current"));
            const actualPixConfig = pixDoc.exists() ? pixDoc.data() : null;
            const cantinaId = actualPixConfig?.current || "indefinido";

            let pixDetails = null;
            if (formData.paymentMethod === "pix") {
                const pixData = await getDoc(doc(db, "pixConfig", cantinaId));
                pixDetails = pixData.exists() ? pixData.data() : null;
                if (!pixDetails) {
                    setLoading(false);
                    return;
                }
            }

            const orderData = {
                clientName: formData.clientName.trim(),
                clientWhatsApp: user ? userData?.telephone || "" : "",
                items: cartItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    pricingTiers: item.pricingTiers || [],
                    lineTotal: calculateLineTotal(item.price, item.quantity, item.pricingTiers),
                })),
                total: cartItems.reduce(
                  (sum, item) => sum + calculateLineTotal(item.price, item.quantity, item.pricingTiers),
                  0,
                ),
                paymentMethod: formData.paymentMethod,
                selectedPix: pixDetails,
                status: "pendente",
                createdAt: Timestamp.now(),
                userId: user?.uid || null,
                cantinaId,
            };
            const orderRef = await addDoc(collection(db, "orders"), orderData);
            await updateDoc(orderRef, { orderId: orderRef.id });

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
                const guestOrderIdsJson = localStorage.getItem("guestOrderIds");
                const guestOrderIds = guestOrderIdsJson ? JSON.parse(guestOrderIdsJson) : [];
                guestOrderIds.push(orderRef.id);
                localStorage.setItem("guestOrderIds", JSON.stringify(guestOrderIds));
            }

            cartItems.forEach((item) => removeFromCart(item.id));
            router.push(`/success?orderId=${orderRef.id}`);
        } catch (error) {
            console.error("Erro ao finalizar o pedido: ", error);
            alert("Ocorreu um erro ao finalizar o pedido. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-800">Pagamento e Informacoes</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!user && (
                    <div>
                        <label htmlFor="clientName" className="mb-1 block text-sm font-medium text-slate-700">
                            Nome Completo <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="clientName"
                            type="text"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className={`w-full rounded-xl border bg-slate-50 p-3 transition-colors focus:outline-none focus:ring-2 ${
                                errors.clientName
                                    ? "border-rose-400 focus:ring-rose-500"
                                    : "border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                            }`}
                            placeholder="Seu nome completo"
                            required
                            minLength={3}
                        />
                        {errors.clientName && <p className="mt-1 text-xs text-rose-600">{errors.clientName}</p>}
                    </div>
                )}

                <div>
                    <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium text-slate-700">
                        Metodo de Pagamento <span className="text-rose-500">*</span>
                    </label>
                    <select
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentType })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-medium text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                    >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="pix">Pix</option>
                        <option value="credito">Cartao de Credito</option>
                        <option value="debito">Cartao de Debito</option>
                    </select>
                    {formData.paymentMethod === "pix" && (
                        <p className="mt-2 rounded-md bg-sky-50 p-2 text-xs text-slate-500">
                            Voce recebera as informacoes para pagamento via PIX na pagina de sucesso.
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`flex w-full items-center justify-center gap-3 rounded-xl p-4 text-lg font-bold text-white transition-all ${
                        loading ? "cursor-not-allowed bg-slate-400" : "bg-sky-600 hover:bg-sky-500"
                    }`}
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
