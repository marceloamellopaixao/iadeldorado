import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PixType } from "@/types/order";

interface PixConfigFormProps {
    cantina: string;
}

export default function PixConfigForm({ cantina }: PixConfigFormProps) {
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
        e.preventDefault();
        await setDoc(doc(db, "pixConfig", cantina), formData);
        alert("Configuração salva com sucesso!");
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4 text-black">Dados PIX</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <label className="block mb-2 font-medium text-black">Nome da Cantina</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded text-black"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-medium text-black">Tipo de Chave</label>
                    <select
                        value={formData.keyType}
                        onChange={(e) =>
                            setFormData({ ...formData, keyType: e.target.value as PixType })
                        }
                        className="w-full p-2 border rounded text-black"
                        required
                    >
                        <option value="celular">Celular</option>
                        <option value="email">Email</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="aleatoria">Chave Aleatória</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-medium text-black">Chave PIX</label>
                    <input
                        type="text"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        className="w-full p-2 border rounded text-black"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium text-black">Titular da Chave</label>
                    <input
                        type="text"
                        value={formData.owner}
                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                        className="w-full p-2 border rounded text-black"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-green-600 text-white rounded"
                >
                    Salvar Configurações
                </button>
            </form>
        </div>
    )
}