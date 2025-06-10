import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; // Importa o cliente Supabase
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, CheckCircle, Truck, XCircle, Loader } from "lucide-react"; // Importe os ícones necessários

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: "processando" | "enviado" | "entregue" | "cancelado";
  totalItems: number;
  total: number;
  items: OrderItem[];
  tracking?: string;
  address: string;
  paymentMethod: string;
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "processando":
      return "bg-yellow-500";
    case "enviado":
      return "bg-blue-500";
    case "entregue":
      return "bg-green-500";
    case "cancelado":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: Order["status"]) => {
  switch (status) {
    case "processando":
      return "Processando";
    case "enviado":
      return "Enviado";
    case "entregue":
      return "Entregue";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
};

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "processando":
      return <Loader className="h-5 w-5 text-yellow-500" />;
    case "enviado":
      return <Truck className="h-5 w-5 text-blue-500" />;
    case "entregue":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "cancelado":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

const OrderHistoryPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          console.error("Erro ao obter usuário:", error);
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível obter o usuário autenticado.",
          });
          setLoading(false);
          return;
        }
        console.log("Usuário autenticado:", user);
        setUsuarioId(user.id);
      } catch (err) {
        console.error("Erro inesperado ao obter usuário:", err);
        toast({
          title: "Erro inesperado",
          description: "Não foi possível autenticar o usuário.",
        });
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!usuarioId) return;

      try {
        console.log("Carregando pedidos para o usuário:", usuarioId);

        const { data: pedidos, error } = await supabase
          .from("pedidos")
          .select(
            `
            id,
            criado_em,
            status,
            valor_total,
            metodo_pagamento,
            codigo_rastreamento,
            enderecos!pedidos_endereco_entrega_id_fkey(
              rua,
              numero,
              complemento,
              bairro,
              cidade,
              estado,
              cep
            ),
            itens_pedido (
              id,
              quantidade,
              preco_unitario,
              produtos(nome)
            )
          `
          )
          .eq("usuario_id", usuarioId);

        if (error) {
          console.error("Erro ao carregar pedidos:", error);
          toast({
            title: "Erro ao carregar pedidos",
            description: error.message,
          });
          return;
        }

        console.log("Pedidos carregados com sucesso:", pedidos);

        const formattedOrders = pedidos.map((pedido) => ({
          id: pedido.id,
          date: pedido.criado_em,
          status: pedido.status,
          total: pedido.valor_total,
          paymentMethod: pedido.metodo_pagamento,
          tracking: pedido.codigo_rastreamento,
          address: pedido.enderecos
            ? `${pedido.enderecos.rua}, ${pedido.enderecos.numero || "S/N"}${
                pedido.enderecos.complemento
                  ? `, ${pedido.enderecos.complemento}`
                  : ""
              }, ${pedido.enderecos.bairro}, ${pedido.enderecos.cidade} - ${
                pedido.enderecos.estado
              }, CEP: ${pedido.enderecos.cep}`
            : "Endereço não disponível",
          items: pedido.itens_pedido.map((item) => ({
            id: item.id,
            name: item.produtos.nome,
            price: item.preco_unitario,
            quantity: item.quantidade,
          })),
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Erro inesperado ao carregar pedidos:", err);
        toast({
          title: "Erro inesperado",
          description: "Não foi possível carregar os pedidos.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [usuarioId]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      {loading ? (
        <Card>
          <CardContent className="p-8 flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-moto-red"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </CardContent>
        </Card>
      ) : orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pedidos</CardTitle>
            <CardDescription>
              Acompanhe todos os seus pedidos e o status de entrega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(-4)}</TableCell>
                    <TableCell>
                      {order.date
                        ? formatDate(order.date)
                        : "Data não disponível"}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} hover:${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.items?.reduce(
                        (total, item) => total + item.quantity,
                        0
                      ) ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.total !== undefined
                        ? order.total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center justify-center"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-medium mb-2">
              Nenhum pedido encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Você ainda não realizou nenhum pedido na nossa loja.
            </p>
            <Button className="bg-moto-red hover:bg-red-700" asChild>
              <a href="/catalogo">Explorar Catálogo</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalhes do pedido */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Pedido realizado em{" "}
              {selectedOrder && formatDate(selectedOrder.date)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Badge
                  className={`${getStatusColor(
                    selectedOrder.status
                  )} hover:${getStatusColor(selectedOrder.status)}`}
                >
                  {getStatusText(selectedOrder.status)}
                </Badge>

                {selectedOrder.tracking && (
                  <div className="text-sm">
                    <span className="font-semibold">Rastreamento:</span>{" "}
                    {selectedOrder.tracking}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Endereço de entrega
                </h4>
                <p className="text-sm text-gray-600">{selectedOrder.address}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Forma de pagamento
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedOrder.paymentMethod}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Itens do pedido</h4>

                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-moto-red font-medium">
                          {item.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(item.price * item.quantity).toLocaleString(
                            "pt-BR",
                            {
                              style: "currency",
                              currency: "BRL",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>
                  {selectedOrder.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="bg-moto-red hover:bg-red-700"
                  onClick={() => setOpenDialog(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistoryPage;
