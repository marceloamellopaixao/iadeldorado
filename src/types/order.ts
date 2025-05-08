export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export type PixType =
    | 'cpf'
    | 'cnpj'
    | 'email'
    | 'celular'
    | 'aleatorio';

export interface PixDetails {

    name: string; // "Cantina das Crianças"
    keyType: PixType; // Tipo da chave Pix
    key: string; // Chave Pix
    owner: string; // Nome do proprietário da chave
}

export type OrderStatus =
    | 'pendente'
    | 'preparando'
    | 'concluido'
    | 'entregue'
    | 'cancelado'
    | 'pagamento pendente'
    | 'pago'
    | 'não pago';

export type PaymentType =
    | 'dinheiro'
    | 'pix'
    | 'cartão de crédito'
    | 'cartão de débito';

export interface Order {
    id: string; // ID do pedido (opcional, pois pode ser gerado automaticamente pelo Firestore)
    clientName: string; // Nome do cliente
    clientWhatsApp: string; // Número do WhatsApp do cliente formatado: 21912345678
    items: CartItem[]; // Itens do pedido
    total: number; // Valor total do pedido
    paymentMethod: PaymentType; // Método de pagamento
    selectedPix?: PixDetails; // Detalhes do pagamento via Pix (opcional)
    status: OrderStatus; // Status do pedido
    userId: string | null; // ID do usuário que fez o pedido (opcional, se o usuário estiver logado)
    createdAt: Date; // Data de criação do pedido
    updatedAt?: Date; // Data de atualização do pedido
}