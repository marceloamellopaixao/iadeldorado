import { useEffect, useState } from "react";
import Head from "next/head";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ActiveCantinaSelector from "@/components/admin/pix-config/ActiveCantinaSelector";
import PixConfigForm from "@/components/admin/pix-config/PixConfigForm";
import { withAuth } from "@/hooks/withAuth";
import { db } from "@/lib/firebase";

type CantinaId = "criancas" | "jovens" | "irmas" | "missoes";

function AdminPixConfigPage() {
    const [selectedCantina, setSelectedCantina] = useState<CantinaId>("criancas");
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
        return <LoadingSpinner message="Carregando configuracoes..." />;
    }

    return (
        <>
            <Head>
                <title>Configuracao de PIX | IAD Eldorado</title>
                <meta name="description" content="Configure as chaves PIX e a cantina ativa." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="cantina-panel mb-8 p-5">
                    <h1 className="cantina-title text-3xl font-bold">Configuracao de Pagamento PIX</h1>
                    <p className="cantina-subtitle mt-1 text-sm">Gerencie qual cantina esta ativa e edite as informacoes da chave PIX.</p>
                </div>

                <div className="mb-8 flex items-center justify-center gap-2 rounded-lg bg-sky-600 p-3 text-center font-bold text-white">
                    <FiCheckCircle />
                    <span>A cantina <span className="capitalize underline">{selectedCantina}</span> esta ativa no momento.</span>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                    <div className="space-y-8">
                        <ActiveCantinaSelector current={selectedCantina} onChange={handleChangeCantina} />
                    </div>
                    <div>
                        <PixConfigForm cantina={selectedCantina} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default withAuth(["admin"])(AdminPixConfigPage);
