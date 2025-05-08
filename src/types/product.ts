export interface Product {
    id: string; // ID do produto (opcional, pois pode ser gerado automaticamente pelo Firestore)
    name: string; // Nome do produto
    description: string; // Descrição do produto
    price: number; // Preço do produto (ex: 19.99)
    category: string; // Categoria do produto (ex: "lanches")
    stock: number; // Estoque do produto
    status: boolean; // Status do produto
    createdAt: Date; // Data de criação do produto
    updatedAt?: Date; // Data de atualização do produto (opcional)
}