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
        return cantina;
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
            <div className="bg-[#041c35] shadow-md rounded-lg p-6 flex flex-col gap-2">
                <h1 className="text-2xl font-bold mb-4 text-white">Configuração de Pix</h1>
                <p className="text-white mb-4">
                    Aqui você pode configurar o sistema de pagamento Pix da IAD Eldorado.
                </p>

                { selectedCantina && (
                    <div className="flex justify-center bg-green-500 text-white p-2 rounded">
                        <span className="text-lg">O PIX da Cantina <span className="font-bold">{selectedCantina}</span> está ativa!</span>
                    </div>
                )}

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