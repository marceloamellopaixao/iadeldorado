import { useEffect, useState } from "react";
import { withAuth } from "@/hooks/withAuth";
import PixConfigForm from "@/components/admin/pix-config/PixConfigForm";
import ActiveCantinaSelector from "@/components/admin/pix-config/ActiveCantinaSelector";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import Head from "next/head";
import { toast } from "react-toastify";
import { FiCheckCircle } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type CantinaId = 'criancas' | 'jovens' | 'irmas' | 'missoes';

function AdminPixConfigPage() {
    const [selectedCantina, setSelectedCantina] = useState<CantinaId>('criancas');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentCantina = async () => {
            try {
                const currentRef = doc(db, "pixConfig", "current");
                const docSnap = await getDoc(currentRef);
                if (docSnap.exists()) {
                    setSelectedCantina(docSnap.data().current);
                }
            } catch {
                toast.error("Erro ao buscar a cantina ativa.");
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentCantina();
    }, []);

    const handleChangeCantina = async (cantina: CantinaId) => {
        setSelectedCantina(cantina);
        try {
            const currentRef = doc(db, "pixConfig", "current");
            await setDoc(currentRef, { current: cantina }, { merge: true });
            toast.success(`Cantina "${cantina}" foi ativada com sucesso!`);
        } catch {
            toast.error("Erro ao atualizar a cantina ativa.");
        }
    };

    if (loading) {
        return <LoadingSpinner message="Carregando configurações..." />;
    }

    return (
        <>
            <Head>
                <title>Configuração de PIX | IAD Eldorado</title>
                <meta name="description" content="Configure as chaves PIX e a cantina ativa." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Configuração de Pagamento PIX</h1>
                    <p className="text-slate-500 mt-1">Gerencie qual cantina está ativa e edite as informações da chave PIX de cada uma.</p>
                </div>

                {/* Banner de status */}
                <div className="mb-8 p-3 rounded-lg bg-teal-500 text-white flex items-center justify-center gap-2 font-bold text-center">
                    <FiCheckCircle />
                    <span>A cantina <span className="underline capitalize">{selectedCantina}</span> está ativa no momento.</span>
                </div>
                
                {/* Grid para organizar os componentes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-8">
                        <ActiveCantinaSelector
                            current={selectedCantina}
                            onChange={handleChangeCantina}
                        />
                    </div>
                    <div>
                        <PixConfigForm cantina={selectedCantina} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default withAuth(['admin'])(AdminPixConfigPage);