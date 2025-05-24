export interface User {
    id: string;
    name: string; // Nome do usuário
    email: string; // Email do usuário
    telephone: string; // Telefone do usuário
    role: string; // Papel do usuário (ex: "admin", "user")
    createdAt: Date; // Data de criação do usuário
    updatedAt?: Date; // Data de atualização do usuário (opcional)
}