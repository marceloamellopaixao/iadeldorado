import { CartItem, PaymentType, PixDetails } from "@/types/order";
import { calculateCartItemTotal } from "@/utils/pricing";

interface WhatsAppMessageParams {
  name: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentType;
  pixDetails?: PixDetails;
}

export const createWhatsAppMessage = ({
  name,
  items,
  total,
  paymentMethod,
  pixDetails,
}: WhatsAppMessageParams): string => {
  const itemsText = items
    .map((item) => `- ${item.name} (${item.quantity}x): R$ ${calculateCartItemTotal(item).toFixed(2).replace(".", ",")}`)
    .join("\n");

  let paymentText = "";
  switch (paymentMethod) {
    case "pix":
      paymentText = pixDetails
        ? `Pagamento via PIX\n- ${pixDetails.name}\n- Tipo: ${pixDetails.keyType.toUpperCase()}\n- Chave: ${pixDetails.key}\n- Titular: ${pixDetails.owner}`
        : "Pagamento via PIX";
      break;
    case "dinheiro":
      paymentText = "Pago em Dinheiro";
      break;
    case "cartão de crédito":
    case "credito":
      paymentText = "Pago com Cartao de Credito";
      break;
    case "cartão de débito":
    case "debito":
      paymentText = "Pago com Cartao de Debito";
      break;
    default:
      paymentText = "Pagamento informado no pedido";
      break;
  }

  return (
    `IAD Eldorado - Recibo do Pedido` +
    `\n\nOla ${name}!` +
    `\n\nResumo da sua compra:` +
    `\n${itemsText}` +
    `\n\nTotal: R$ ${total.toFixed(2).replace(".", ",")}` +
    `\n\n${paymentText}` +
    `\n\nObrigado pela preferencia!`
  );
};

