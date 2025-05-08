import { CartItem, PaymentType, PixDetails } from "@/types/order";

interface WhatsAppMessageParams {
    name: string; // Nome do cliente
    items: CartItem[]; // Itens do pedido
    total: number; // Valor total do pedido
    paymentMethod: PaymentType; // Método de pagamento
    pixDetails?: PixDetails; // Detalhes do pagamento via Pix (opcional)
}

export const createWhatsAppMessage = ({
    name,
    items,
    total,
    paymentMethod,
    pixDetails,
}: WhatsAppMessageParams): string => {
    const itemsText = items.map(item =>
        `➡ ${item.name} (${item.quantity}x): R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    let paymentText = "";
    switch (paymentMethod) {
        case 'pix':
            paymentText = pixDetails
                ? `💳 *Pagamento via PIX*\n` +
                `🔹 ${pixDetails.name}\n` +
                `🔹 Tipo: ${pixDetails.keyType}\n` +
                `🔹 Chave: ${pixDetails.key}\n` +
                `🔹 Titular: ${pixDetails.owner}`
                : `💳 *Pagamento via PIX*`;
            break;

        case 'dinheiro':
            paymentText = `💵 *Pago em Dinheiro*`;
            break;

        case 'cartão de crédito':
            paymentText = `💳 *Pago com Cartão de Crédito*`;
            break;

        case 'cartão de débito':
            paymentText = `💳 *Pago com Cartão de Débito*`;
            break;
    }

    return `*IAD Eldorado - Recibo do Pedido*` +
        `\n\n👋 Olá ${name}!` +
        `\n\n📝 *Resumo da sua compra:*` +
        `\n${itemsText}` +
        `\n\n💰 *Total: R$ ${total}*` +
        `\n\n${paymentText}\n\n` +
        `🙏 Obrigado pela preferência!`;
}