import { useState } from "react";
import { withAuth } from "@/hooks/withAuth";
import PixConfigForm from "@/components/admin/pix-config/PixConfigForm";
import ActiveCantinaSelector from "@/components/admin/pix-config/ActiveCantinaSelector";

function AdminPixConfigPage() {
    const [selectedCantina, setSelectedCantina] = useState<
        'criancas' | 'jovens' | 'irmas' | 'missoes'
    >('criancas');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2x1 font-bold mb-6">Configuração de Cantinas</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ActiveCantinaSelector
                        current={selectedCantina}
                        onChange={setSelectedCantina}
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