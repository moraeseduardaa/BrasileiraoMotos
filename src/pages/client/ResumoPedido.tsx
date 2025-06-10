import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Eye } from "lucide-react";

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

// Dados mockados para demonstração
const mockOrders: Order[] = [
  {
    id: "1001",
    date: "2023-04-15T10:30:00",
    status: "entregue",
    totalItems: 3,
    total: 259.7,
    items: [
      { id: "1", name: "Kit Relação Honda CG 160", price: 169.9, quantity: 1 },
      { id: "3", name: "Óleo Motor 10W30 1L", price: 32.9, quantity: 2 },
      { id: "5", name: "Vela de Ignição", price: 25.9, quantity: 1 },
    ],
    tracking: "BR123456789",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567",
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "1002",
    date: "2023-05-20T14:45:00",
    status: "enviado",
    totalItems: 2,
    total: 85.8,
    items: [
      { id: "2", name: "Jogo de Pastilhas de Freio", price: 45.9, quantity: 1 },
      { id: "4", name: "Filtro de Ar CG 160", price: 39.9, quantity: 1 },
    ],
    tracking: "BR987654321",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-000",
    paymentMethod: "PIX",
  },
  {
    id: "1003",
    date: "2023-06-05T09:15:00",
    status: "processando",
    totalItems: 1,
    total: 129.9,
    items: [{ id: "6", name: "Bateria 5Ah", price: 129.9, quantity: 1 }],
    address: "Rua Augusta, 500 - Consolação, São Paulo - SP, 01304-000",
    paymentMethod: "Boleto Bancário",
  },
];

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

const OrderHistoryPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Simula carregamento de dados da API
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1500);
  }, []);

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
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} hover:${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.totalItems}</TableCell>
                    <TableCell className="text-right">
                      {order.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
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
