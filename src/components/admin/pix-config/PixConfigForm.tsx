import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PixType } from "@/types/order";

interface PixConfigFormProps {
    cantina: string;
}

export default function PixConfigForm({ cantina }: PixConfigFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        keyType: "celular" as PixType,
        key: "",
        owner: ""
    });

    useEffect(() => {
        const loadConfig = async () => {
            const docRef = doc(db, "pixConfig", cantina);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setFormData(docSnap.data() as {
                    name: string;
                    keyType: PixType;
                    key: string;
                    owner: string;
                });
            }
        };

        loadConfig();
    }, [cantina]);

    const handleSubmit = async (e: React.FormEvent) => {
        setIsLoading(true);
        e.preventDefault();
        await setDoc(doc(db, "pixConfig", cantina), formData);
        alert("Configuração salva com sucesso!");
        setIsLoading(false);
    };

    return (
        <div className="border-2 border-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4 text-white">Dados PIX</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <label className="block mb-2 font-medium text-white">Nome da Cantina</label>
                    <input
                        type="text"
                        placeholder="Nome da Cantina"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded text-white"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-medium text-white">Tipo de Chave</label>
                    <select
                        value={formData.keyType}
                        onChange={(e) =>
                            setFormData({ ...formData, keyType: e.target.value as PixType })
                        }
                        className="w-full p-2 border rounded text-white"
                        required
                    >
                        <option value="celular" className="text-black">Celular</option>
                        <option value="email" className="text-black">Email</option>
                        <option value="cpf" className="text-black">CPF</option>
                        <option value="cnpj" className="text-black">CNPJ</option>
                        <option value="aleatoria" className="text-black">Chave Aleatória</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-medium text-white">Chave PIX</label>
                    <input
                        type="text"
                        placeholder="Chave PIX"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        className="w-full p-2 border rounded text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium text-white">Titular da Chave</label>
                    <input
                        type="text"
                        placeholder="Nome do Titular"
                        value={formData.owner}
                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                        className="w-full p-2 border rounded text-white"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-green-600 text-white rounded"
                >
                    {isLoading ? "Carregando..." : "Salvar Configurações"}
                </button>
            </form>
        </div>
    )
}