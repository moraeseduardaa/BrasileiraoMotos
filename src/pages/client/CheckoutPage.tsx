import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check, CreditCard, Wallet, HandCoins } from "lucide-react";

// Schema para validação do formulário de pagamento e entrega
const checkoutFormSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  street: z.string().min(3, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  zipCode: z.string().min(8, "CEP inválido"),
  paymentMethod: z.enum(["credit_card", "debit_card", "pix", "bank_slip"]),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CheckoutPage = () => {
  const { items, totalItems, totalPrice, shippingFee, discount, clearCart } =
    useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
      notes: "",
    },
  });

  const pixDiscountRate = 0.05; // 5% de desconto para pagamentos via PIX
  const isPixPayment = form.watch("paymentMethod") === "pix";
  const selectedPaymentMethod = form.watch("paymentMethod");
  const subtotal = totalPrice - shippingFee + discount;
  const finalTotalPrice = isPixPayment
    ? totalPrice * (1 - pixDiscountRate)
    : totalPrice;

  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description:
          "Adicione produtos ao carrinho antes de finalizar a compra",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Dados do pedido:", {
        customer: {
          name: data.fullName,
          email: data.email,
          phone: data.phone,
        },
        shipping: {
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        payment: {
          method: data.paymentMethod,
          cardDetails: data.paymentMethod.includes("card")
            ? {
                number: data.cardNumber,
                name: data.cardName,
                expiry: data.cardExpiry,
                cvv: data.cardCvv,
              }
            : null,
        },
        order: {
          items,
          subtotal,
          shipping: shippingFee,
          discount: isPixPayment
            ? discount + totalPrice * pixDiscountRate
            : discount,
          total: finalTotalPrice,
        },
        notes: data.notes,
      });

      clearCart();

      navigate("/cliente/pedido-finalizado", {
        state: {
          orderId: `BR-${Math.floor(Math.random() * 100000)}`,
          paymentMethod: data.paymentMethod,
        },
      });

      setIsSubmitting(false);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-amber-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">
            Você precisa adicionar produtos ao carrinho antes de finalizar a
            compra.
          </p>
          <Button className="bg-moto-red hover:bg-red-700" asChild>
            <a href="/catalogo">Ver Produtos</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Checkout */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Cliente</CardTitle>
                  <CardDescription>
                    Informe seus dados para contato e entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                  <CardDescription>
                    Informe o endereço onde deseja receber seu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Rua, Avenida, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto, Casa, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pagamento</CardTitle>
                  <CardDescription>
                    Escolha como você deseja pagar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Cartão de Crédito */}
                            <div
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "credit_card"
                                  ? "border-moto-red bg-red-50"
                                  : "border-gray-200"
                              }`}
                              onClick={() =>
                                form.setValue("paymentMethod", "credit_card")
                              }
                            >
                              <div className="flex flex-col items-center text-center">
                                <CreditCard className="h-8 w-8 mb-2" />
                                <div className="font-medium">
                                  Cartão de Crédito
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  3X sem Juros
                                </p>
                              </div>
                              {field.value === "credit_card" && (
                                <div className="absolute top-2 right-2 text-moto-red">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            {/* Cartão de Débito */}
                            <div
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "debit_card"
                                  ? "border-moto-red bg-red-50"
                                  : "border-gray-200"
                              }`}
                              onClick={() =>
                                form.setValue("paymentMethod", "debit_card")
                              }
                            >
                              <div className="flex flex-col items-center text-center">
                                <Wallet className="h-8 w-8 mb-2" />
                                <div className="font-medium">
                                  Cartão de Débito
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  3X sem juros
                                </p>
                              </div>
                              {field.value === "debit_card" && (
                                <div className="absolute top-2 right-2 text-moto-red">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            {/* PIX */}
                            <div
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "pix"
                                  ? "border-moto-red bg-red-50"
                                  : "border-gray-200"
                              }`}
                              onClick={() =>
                                form.setValue("paymentMethod", "pix")
                              }
                            >
                              <div className="flex flex-col items-center text-center">
                                <svg
                                  className="h-8 w-8 mb-2"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M16.8297 16.1891C15.601 17.4178 13.7255 17.4178 12.4968 16.1891L12.0909 15.7832L11.1375 16.7366L11.5434 17.1425C12.1627 17.7618 12.9434 18.1497 13.7958 18.2853C14.6482 18.4209 15.5235 18.2968 16.2927 17.93C17.0619 17.5631 17.6864 16.9726 18.0742 16.231C18.462 15.4893 18.5983 14.6363 18.4657 13.7993C18.3332 12.9623 17.9382 12.1882 17.3307 11.5807L17.0263 11.2763L16.0729 12.2297L16.3773 12.534C16.7802 12.937 17.0232 13.4765 17.0577 14.0497C17.092 14.6228 16.9154 15.1882 16.5651 15.6324C16.2147 16.0767 15.7161 16.3709 15.1668 16.46C14.6175 16.549 14.0535 16.4268 13.5873 16.1152L16.8297 12.8729L16.8297 12.8728L16.8297 16.1891ZM7.57347 7.56103C8.80219 6.33231 10.6777 6.33231 11.9064 7.56103L12.3123 7.96694L13.2657 7.01356L12.8598 6.60764C12.2405 5.98839 11.4598 5.60044 10.6074 5.46486C9.75506 5.3293 8.8797 5.45341 8.11048 5.8202C7.34125 6.18709 6.71676 6.77764 6.32895 7.51928C5.94114 8.26091 5.80486 9.1139 5.9374 9.95085C6.06993 10.7878 6.46499 11.5619 7.07245 12.1694L7.37692 12.4739L8.3303 11.5205L8.02582 11.216C7.62293 10.813 7.37998 10.2735 7.34551 9.70039C7.31114 9.12727 7.48781 8.56192 7.83815 8.11764C8.18849 7.67336 8.68708 7.37922 9.23637 7.29013C9.78566 7.20105 10.3497 7.3233 10.8159 7.63496L7.57347 10.8773L7.57347 10.8773V7.56103ZM11.9064 16.1891C11.9064 16.189 11.9064 16.189 11.9064 16.1889L8.66404 12.9466C8.35237 13.4127 8.23012 13.9769 8.31921 14.5262C8.4083 15.0755 8.70244 15.574 9.14672 15.9244C9.591 16.2747 10.1564 16.4514 10.7295 16.417C11.3026 16.3825 11.8421 16.1396 12.2451 15.7367L12.5495 15.4322L13.5029 16.3856L13.1985 16.6901C12.5909 17.2976 11.8169 17.6926 10.9799 17.8252C10.1429 17.9577 9.29 17.8214 8.54835 17.4336C7.80669 17.0458 7.21614 16.4214 6.84925 15.6521C6.48246 14.8828 6.35835 14.0075 6.49391 13.1551C6.62949 12.3027 7.01744 11.522 7.63669 10.9028L7.57347 10.8395L11.9064 16.1891Z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <div className="font-medium">PIX</div>
                                <p className="text-xs text-green-600 mt-1">
                                  5% mais barato
                                </p>
                              </div>
                              {field.value === "pix" && (
                                <div className="absolute top-2 right-2 text-moto-red">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            {/* Boleto */}
                            <div
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "bank_slip"
                                  ? "border-moto-red bg-red-50"
                                  : "border-gray-200"
                              }`}
                              onClick={() =>
                                form.setValue("paymentMethod", "bank_slip")
                              }
                            >
                              <div className="flex flex-col items-center text-center">
                                <HandCoins className="h-8 w-8 mb-2" />
                                <div className="font-medium">Boleto</div>
                              </div>
                              {field.value === "bank_slip" && (
                                <div className="absolute top-2 right-2 text-moto-red">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campos de cartão condicionais */}
                  {(selectedPaymentMethod === "credit_card" ||
                    selectedPaymentMethod === "debit_card") && (
                    <div className="space-y-4 mt-4 pt-4 border-t">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Cartão</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0000 0000 0000 0000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cardName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome no Cartão</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="NOME COMO ESTÁ NO CARTÃO"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validade</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/AA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardCvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === "pix" && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Um QR Code para pagamento será gerado após a
                          confirmação do pedido.
                        </p>
                        <p className="text-xs text-gray-500">
                          O pagamento via PIX é processado instantaneamente.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === "bank_slip" && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Um boleto será gerado após a confirmação do pedido.
                        </p>
                        <p className="text-xs text-gray-500">
                          O prazo para compensação do boleto é de até 3 dias
                          úteis.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>
                    Alguma informação adicional para o seu pedido?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Instruções para entrega, observações sobre produtos, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full md:w-auto bg-moto-red hover:bg-red-700"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : "Finalizar Compra"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Resumo do Pedido */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription>
                {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Itens resumidos */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      {item.cores && (
                        <p className="text-xs text-gray-500">
                          Cor: {item.cores}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium text-right">
                      {(item.price * item.quantity).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Valores */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    {subtotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete</span>
                  <span>
                    {shippingFee.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>
                      -
                      {discount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                )}

                {isPixPayment && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto PIX</span>
                    <span>
                      -
                      {(totalPrice * pixDiscountRate).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {finalTotalPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
