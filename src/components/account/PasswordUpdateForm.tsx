import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiLock, FiLoader } from 'react-icons/fi';

interface PasswordInputProps {
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, value, onChange, id }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="relative mt-1">
                <input 
                    id={id}
                    type={showPassword ? "text" : "password"} 
                    value={value} 
                    onChange={onChange} 
                    className="block w-full border-slate-300 rounded-lg shadow-sm p-3 pr-10 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900"
                    minLength={6}
                    required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-sky-600">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
        </div>
    );
};

export default function PasswordUpdateForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !user.email) {
            toast.error('Usuário não autenticado.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            toast.success('Senha atualizada com sucesso! Você pode precisar fazer login novamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            switch (err) {
                case 'auth/wrong-password':
                    toast.error('Senha atual incorreta. Tente novamente.');
                    break;
                case 'auth/weak-password':
                    toast.error('A nova senha é muito fraca. Tente uma mais forte.');
                    break;
                case 'auth/requires-recent-login':
                    toast.error('Esta operação é sensível e exige autenticação recente. Faça login novamente antes de tentar.');
                    break;
                default:
                    toast.error('Ocorreu um erro ao atualizar a senha.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-5'>
            <PasswordInput label="Senha Atual" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <PasswordInput label="Nova Senha" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <PasswordInput label="Confirmar Nova Senha" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <div className=''>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors disabled:bg-slate-400">
                    {loading ? (
                         <>
                            <FiLoader className="animate-spin" />
                            <span>Atualizando...</span>
                        </>
                    ) : (
                        <>
                            <FiLock />
                            <span>Atualizar Senha</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}