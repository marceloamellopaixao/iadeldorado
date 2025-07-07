import { FiAlertCircle } from "react-icons/fi";

type CantinaId = 'criancas' | 'jovens' | 'irmas' | 'missoes';

interface CantinaOption {
    id: CantinaId;
    name: string;
}

interface ActiveCantinaSelectorProps {
    current: CantinaId;
    onChange: (cantina: CantinaId) => void;
}

export default function ActiveCantinaSelector({ current, onChange }: ActiveCantinaSelectorProps) {
    const cantinas: CantinaOption[] = [
        { id: 'criancas', name: 'Cantina das Crianças' },
        { id: 'jovens', name: 'Cantina dos Jovens' },
        { id: 'irmas', name: 'Cantina das Irmãs' },
        { id: 'missoes', name: 'Cantina das Missões' }
    ];

    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900 font-semibold";

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ativar Cantina para Venda</h3>
            <p className="text-sm text-slate-500 mb-4">Selecione qual cantina estará recebendo os pedidos e pagamentos no momento.</p>
            <select
                value={current}
                onChange={(e) => onChange(e.target.value as CantinaId)}
                className={inputBaseStyle}
            >
                {cantinas.map((cantina) => (
                    <option key={cantina.id} value={cantina.id}>
                        {cantina.name}
                    </option>
                ))}
            </select>
            <div className="mt-4 bg-amber-50 text-amber-800 p-3 rounded-lg flex items-center gap-3 text-sm">
                <FiAlertCircle className="shrink-0" />
                <span>Apenas a cantina selecionada aqui aparecerá como opção de pagamento para os clientes.</span>
            </div>
        </div>
    );
}