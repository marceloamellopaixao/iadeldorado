import { useEffect, useState } from "react";
import { withAuth } from "@/hooks/withAuth";
import PixConfigForm from "@/components/admin/pix-config/PixConfigForm";
import ActiveCantinaSelector from "@/components/admin/pix-config/ActiveCantinaSelector";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import Head from "next/head";

function AdminPixConfigPage() {
    // Estado para armazenar a cantina selecionada
    const [selectedCantina, setSelectedCantina] = useState<
        'criancas' | 'jovens' | 'irmas' | 'missoes'
    >('criancas');

    // Função para lidar com a mudança de cantina
    const handleChangeCantina = async (cantina: typeof selectedCantina) => {
        setSelectedCantina(cantina);

        // Atualiza no Firestore o campo current
        const currentRef = doc(db, "pixConfig", "current");
        await setDoc(currentRef, { current: cantina }, { merge: true });

        alert("Cantina selecionada com sucesso!")
    };

    // Busca a cantina atual do Firestore
    // e atualiza o estado local
    useEffect(() => {
        const fetchCurrentCantina = async () => {
            const currentRef = doc(db, "pixConfig", "current");
            const docSnap = await getDoc(currentRef);
            if (docSnap.exists()) {
                setSelectedCantina(docSnap.data().current);
            }
        };

        fetchCurrentCantina();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <Head>
                <title>IAD Eldorado - Configuração de Pix</title>
                <meta name="description" content="Configuração do sistema de pagamento Pix na IAD Eldorado." />
            </Head>
            <h1 className="text-2xl font-bold mb-6">Configuração de Cantinas</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ActiveCantinaSelector
                        current={selectedCantina}
                        onChange={handleChangeCantina}
                    />
                </div>

                <div className="lg:col-span-2">
                    <PixConfigForm cantina={selectedCantina} />
                </div>
            </div>
        </div>
    );
}

export default withAuth(['admin'])(AdminPixConfigPage);