import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function PasswordUpdateForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user || !user.email) {
            setError('Usuário não autenticado. Por favor, faça login.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            // Cria credencial com a senha atual
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // Reautentica o usuário
            await reauthenticateWithCredential(user, credential);

            // Atualiza a senha
            await updatePassword(user, newPassword);

            // Envia e-mail de verificação
            await sendEmailVerification(user);

            alert('Verifique seu e-mail para confirmação.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Erro ao atualizar a senha:', error);

            switch (error) {
                case 'auth/wrong-password':
                    setError('Senha atual incorreta. Tente novamente.');
                    break;
                case 'auth/weak-password':
                    setError('A nova senha deve ter pelo menos 6 caracteres.');
                    break;
                case 'auth/requires-recent-login':
                    setError('Você precisa logar novamente para atualizar a senha.');
                    break;
                default:
                    setError('Erro ao atualizar a senha: ' + error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
                <label className='block mb-1'>Senha Atual</label>
                <input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className='w-full p-2 border rounded'
                    required
                />
            </div>

            <div>
                <label className="block mb-1">Nova Senha (mínimo 6 caracteres)</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    minLength={6}
                    required
                />
            </div>

            <div>
                <label className="block mb-1">Confirmar Nova Senha</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    minLength={6}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <p className="text-center">Atualizando senha...</p>
                    </div>
                ) : 'Atualizar Senha'}
            </button>
        </form>
    )
}