import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PixType } from "@/types/order";
import { toast } from "react-toastify";
import { FiSave } from "react-icons/fi";

interface PixConfigFormProps {
    cantina: string;
}

const initialState = {
    name: "",
    keyType: "celular" as PixType,
    key: "",
    owner: ""
};

export default function PixConfigForm({ cantina }: PixConfigFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        const loadConfig = async () => {
            if (!cantina) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, "pixConfig", cantina);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData(docSnap.data() as typeof initialState);
                } else {
                    setFormData(initialState); // Reseta se não houver config salva
                }
            } catch {
                toast.error("Erro ao carregar configuração do PIX.");
            } finally {
                setIsLoading(false);
            }
        };

        loadConfig();
    }, [cantina]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await setDoc(doc(db, "pixConfig", cantina), {
                ...formData,
                updatedAt: serverTimestamp()
            });
            toast.success(`Configuração da cantina "${cantina}" salva com sucesso!`);
        } catch {
            toast.error("Erro ao salvar a configuração.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
                Editar Chave PIX da Cantina Selecionada
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className={labelBaseStyle}>Nome da Cantina (Apelido)</label>
                    <input id="name" type="text" placeholder="Ex: Cantina dos Jovens" className={inputBaseStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                    <label htmlFor="owner" className={labelBaseStyle}>Nome do Titular da Conta</label>
                    <input id="owner" type="text" placeholder="Nome completo do responsável" className={inputBaseStyle} value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} required />
                </div>
                <div>
                    <label htmlFor="keyType" className={labelBaseStyle}>Tipo de Chave PIX</label>
                    <select id="keyType" className={inputBaseStyle} value={formData.keyType} onChange={(e) => setFormData({ ...formData, keyType: e.target.value as PixType })} required>
                        <option value="celular">Celular</option>
                        <option value="email">E-mail</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="aleatoria">Chave Aleatória</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="key" className={labelBaseStyle}>Chave PIX</label>
                    <input id="key" type="text" placeholder="Insira a chave aqui" className={inputBaseStyle} value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} required />
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors disabled:bg-slate-400">
                        <FiSave />
                        <span>{isLoading ? "Salvando..." : "Salvar Configurações"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}