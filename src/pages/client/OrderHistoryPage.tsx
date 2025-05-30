import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  Wallet,
  DollarSign,
} from "lucide-react";

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case "credit_card":
        return <CreditCard className="h-6 w-6" />;
      case "debit_card":
        return <Wallet className="h-6 w-6" />;
      case "mercado_pago":
        return <ShoppingBag className="h-6 w-6 text-blue-600" />;
      case "pix":
        return (
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.8297 16.1891C15.601 17.4178 13.7255 17.4178 12.4968 16.1891L12.0909 15.7832L11.1375 16.7366L11.5434 17.1425C12.1627 17.7618 12.9434 18.1497 13.7958 18.2853C14.6482 18.4209 15.5235 18.2968 16.2927 17.93C17.0619 17.5631 17.6864 16.9726 18.0742 16.231C18.462 15.4893 18.5983 14.6363 18.4657 13.7993C18.3332 12.9623 17.9382 12.1882 17.3307 11.5807L17.0263 11.2763L16.0729 12.2297L16.3773 12.534C16.7802 12.937 17.0232 13.4765 17.0577 14.0497C17.092 14.6228 16.9154 15.1882 16.5651 15.6324C16.2147 16.0767 15.7161 16.3709 15.1668 16.46C14.6175 16.549 14.0535 16.4268 13.5873 16.1152L16.8297 12.8729L16.8297 12.8728L16.8297 16.1891ZM7.57347 7.56103C8.80219 6.33231 10.6777 6.33231 11.9064 7.56103L12.3123 7.96694L13.2657 7.01356L12.8598 6.60764C12.2405 5.98839 11.4598 5.60044 10.6074 5.46486C9.75506 5.3293 8.8797 5.45341 8.11048 5.8202C7.34125 6.18709 6.71676 6.77764 6.32895 7.51928C5.94114 8.26091 5.80486 9.1139 5.9374 9.95085C6.06993 10.7878 6.46499 11.5619 7.07245 12.1694L7.37692 12.4739L8.3303 11.5205L8.02582 11.216C7.62293 10.813 7.37998 10.2735 7.34551 9.70039C7.31114 9.12727 7.48781 8.56192 7.83815 8.11764C8.18849 7.67336 8.68708 7.37922 9.23637 7.29013C9.78566 7.20105 10.3497 7.3233 10.8159 7.63496L7.57347 10.8773L7.57347 10.8773V7.56103ZM11.9064 16.1891C11.9064 16.189 11.9064 16.189 11.9064 16.1889L8.66404 12.9466C8.35237 13.4127 8.23012 13.9769 8.31921 14.5262C8.4083 15.0755 8.70244 15.574 9.14672 15.9244C9.591 16.2747 10.1564 16.4514 10.7295 16.417C11.3026 16.3825 11.8421 16.1396 12.2451 15.7367L12.5495 15.4322L13.5029 16.3856L13.1985 16.6901C12.5909 17.2976 11.8169 17.6926 10.9799 17.8252C10.1429 17.9577 9.29 17.8214 8.54835 17.4336C7.80669 17.0458 7.21614 16.4214 6.84925 15.6521C6.48246 14.8828 6.35835 14.0075 6.49391 13.1551C6.62949 12.3027 7.01744 11.522 7.63669 10.9028L7.57347 10.8395L11.9064 16.1891Z"
              fill="currentColor"
            />
          </svg>
        );
      case "bank_slip":
        return <DollarSign className="h-6 w-6" />;
      default:
        return <ShoppingBag className="h-6 w-6" />;
    }
  };

  const getPaymentText = () => {
    switch (paymentMethod) {
      case "credit_card":
        return "Pagamento com cartão de crédito processado com sucesso.";
      case "debit_card":
        return "Pagamento com cartão de débito processado com sucesso.";
      case "mercado_pago":
        return "Pagamento processado com sucesso através do Mercado Pago.";
      case "pix":
        return "Aguardando confirmação do PIX. Verifique seu e-mail para instruções.";
      case "bank_slip":
        return "O boleto foi enviado para seu e-mail. O pedido será processado após o pagamento.";
      default:
        return "Seu pedido foi processado com sucesso.";
    }
  };

  // ... keep existing code (renderPixSection function)

  const renderPixSection = () => {
    if (paymentMethod === "pix") {
      return (
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-4 text-center">
            Pagamento via PIX
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="w-48 h-48 bg-white p-3 rounded-lg border shadow-sm flex items-center justify-center">
              <div
                id="qrcode"
                className="w-full h-full flex items-center justify-center"
              >
                <p className="text-sm text-gray-500 text-center">
                  Escaneie o QR Code que foi enviado para o seu e-mail para
                  finalizar o pagamento.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-w-sm">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium">Chave PIX:</p>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1 font-mono">
                  10105714941
                </p>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium">Valor:</p>
                <p className="text-lg font-bold text-green-600">
                  Conforme enviado por e-mail
                </p>
              </div>

              <div className="text-sm text-gray-600 p-2">
                <p>1. Abra o aplicativo do seu banco</p>
                <p>2. Selecione a opção PIX e escaneie o QR Code</p>
                <p>3. Confirme o valor e finalize o pagamento</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-center text-gray-600">
            Após a confirmação do pagamento, seu pedido será processado.
          </p>
        </div>
      );
    }
    return null;
  };

  if (!orderId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
          <Check className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Pedido Recebido!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Obrigado por comprar na Brasileirão Motos 044.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-4">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-500">Número do Pedido</p>
              <p className="text-xl font-bold">{orderId}</p>
            </div>

            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
              {getPaymentIcon()}
              <span className="ml-2 font-medium">
                {paymentMethod === "credit_card" && "Cartão de Crédito"}
                {paymentMethod === "debit_card" && "Cartão de Débito"}
                {paymentMethod === "mercado_pago" && "Mercado Pago"}
                {paymentMethod === "pix" && "PIX"}
                {paymentMethod === "bank_slip" && "Boleto Bancário"}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{getPaymentText()}</p>

          {renderPixSection()}

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Próximos passos:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span>
                  Você receberá um e-mail com a confirmação do pedido.
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span>Nossa equipe irá preparar seu pedido para envio.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span>
                  Você receberá atualizações sobre o status do seu pedido.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-moto-red hover:bg-red-700">
            <a href="/cliente/pedidos">
              Meus Pedidos
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <Button variant="outline" asChild>
            <a href="/catalogo">Continuar Comprando</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
