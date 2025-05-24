type CantinaId = 'criancas' | 'jovens' | 'irmas' | 'missoes';

interface CantinaOption {
    id: CantinaId;
    name: string;
}

interface ActiveCantinaSelectorProps {
    current: CantinaId;
    onChange: (cantina: CantinaId) => void;
}

export default function ActiveCantinaSelector({
    current,
    onChange
}: ActiveCantinaSelectorProps) {
    const cantinas: CantinaOption[] = [
        { id: 'criancas', name: 'Cantina das Crianças' },
        { id: 'jovens', name: 'Cantina dos Jovens' },
        { id: 'irmas', name: 'Cantina das Irmãs' },
        { id: 'missoes', name: 'Cantina das Missões' }
    ];

    return (
        <div className="border-2 border-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-white mb-3">Selecionar Cantina</h3>
            <select
                value={current}
                onChange={(e) => onChange(e.target.value as CantinaId)}
                className=" w-full p-2 text-white border rounded"
            >
                {cantinas.map((cantina) => (
                    <option key={cantina.id} value={cantina.id} className="text-black">
                        {cantina.name}
                    </option>
                ))}
            </select>
        </div>
    );

}