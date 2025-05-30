import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  User,
} from "lucide-react";

// Tipos
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Dados mockados para demonstração
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Kit Relação Honda CG 160",
    price: 169.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Kit+Relação",
    category: "Transmissão",
    stock: 15,
  },
  {
    id: "2",
    name: "Jogo de Pastilhas de Freio",
    price: 45.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Pastilhas+Freio",
    category: "Freios",
    stock: 22,
  },
  {
    id: "3",
    name: "Óleo Motor 10W30 1L",
    price: 32.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Óleo+Motor",
    category: "Lubrificantes",
    stock: 45,
  },
  {
    id: "4",
    name: "Filtro de Ar CG 160",
    price: 39.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Filtro+Ar",
    category: "Filtros",
    stock: 18,
  },
  {
    id: "5",
    name: "Vela de Ignição",
    price: 25.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Vela+Ignição",
    category: "Elétrica",
    stock: 30,
  },
];

// Schema de validação para o formulário de pedido
const orderSchema = z.object({
  customerName: z
    .string()
    .min(3, "Nome do cliente deve ter pelo menos 3 caracteres"),
  customerEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  customerPhone: z.string().min(10, "Número de telefone inválido"),
  paymentMethod: z.enum([
    "dinheiro",
    "cartao_credito",
    "cartao_debito",
    "pix",
    "boleto",
  ]),
  discount: z.coerce
    .number()
    .min(0, "Desconto não pode ser negativo")
    .default(0),
  shippingFee: z.coerce
    .number()
    .min(0, "Frete não pode ser negativo")
    .default(0),
  notes: z.string().optional().or(z.literal("")),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const ManualOrderPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [newOrderId, setNewOrderId] = useState<string>("");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      paymentMethod: "dinheiro",
      discount: 0,
      shippingFee: 0,
      notes: "",
    },
  });

  useEffect(() => {
    // Simula carregamento de produtos da API
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsProductDialogOpen(true);
  };

  const addItemToOrder = () => {
    if (!selectedProduct) return;

    // Verifica se a quantidade é válida
    if (quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    // Verifica se há estoque suficiente
    if (quantity > selectedProduct.stock) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${selectedProduct.stock} unidades disponíveis`,
        variant: "destructive",
      });
      return;
    }

    // Verifica se o item já existe no pedido
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      // Atualiza a quantidade e total do item existente
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].price *
        updatedItems[existingItemIndex].quantity;
      setOrderItems(updatedItems);
    } else {
      // Adiciona um novo item
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        total: selectedProduct.price * quantity,
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Atualiza o estoque do produto
    const updatedProducts = products.map((p) => {
      if (p.id === selectedProduct.id) {
        return { ...p, stock: p.stock - quantity };
      }
      return p;
    });
    setProducts(updatedProducts);
    setFilteredProducts(
      updatedProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setIsProductDialogOpen(false);
    toast({
      title: "Produto adicionado",
      description: `${quantity} unidade(s) de ${selectedProduct.name} adicionada(s) ao pedido`,
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    // Encontra o item a ser removido
    const itemToRemove = orderItems.find((item) => item.id === itemId);

    if (!itemToRemove) return;

    // Atualiza o estoque do produto
    const updatedProducts = products.map((p) => {
      if (p.id === itemToRemove.productId) {
        return { ...p, stock: p.stock + itemToRemove.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);
    setFilteredProducts(
      updatedProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Remove o item do pedido
    setOrderItems(orderItems.filter((item) => item.id !== itemId));

    toast({
      title: "Produto removido",
      description: `${itemToRemove.name} foi removido do pedido`,
    });
  };

  const onSubmitOrder = (data: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast({
        title: "Pedido vazio",
        description: "Adicione pelo menos um produto ao pedido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    // Simula o envio do pedido para API
    setTimeout(() => {
      const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
      setNewOrderId(orderId);
      setIsSaving(false);
      setIsSuccessDialogOpen(true);
      console.log("Novo pedido:", {
        id: orderId,
        customer: {
          name: data.customerName,
          email: data.customerEmail || "N/A",
          phone: data.customerPhone,
        },
        items: orderItems,
        payment: {
          method: data.paymentMethod,
          subtotal,
          discount: data.discount,
          shipping: data.shippingFee,
          total: subtotal - data.discount + data.shippingFee,
        },
        notes: data.notes,
        date: new Date().toISOString(),
      });
    }, 1500);
  };

  const resetOrder = () => {
    // Resetar formulário
    reset({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      paymentMethod: "dinheiro",
      discount: 0,
      shippingFee: 0,
      notes: "",
    });

    // Resetar itens do pedido
    setOrderItems([]);

    // Fechar dialog de sucesso
    setIsSuccessDialogOpen(false);

    // Recarregar produtos (simulando uma nova busca no banco de dados)
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 500);

    toast({
      title: "Pedido reiniciado",
      description: "Um novo pedido pode ser iniciado agora",
    });
  };

  const calculateTotal = (formData: Partial<OrderFormValues>) => {
    const discount = formData.discount || 0;
    const shipping = formData.shippingFee || 0;
    return subtotal - discount + shipping;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Novo Pedido Manual</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Produtos e busca */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>
              Busque e adicione produtos ao pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>

            <div className="border rounded-md">
              {loading ? (
                <div className="p-8 flex justify-center">
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
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-md p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => openProductDialog(product)}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="flex-grow">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-moto-red font-medium">
                            {product.price.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                          <span className="text-sm text-gray-500">
                            Estoque: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium text-gray-600">
                    Nenhum produto encontrado
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Tente buscar por outro termo
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-3">Itens do Pedido</h3>
              {orderItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">
                          {item.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItemFromOrder(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 border rounded-md bg-gray-50">
                  <p className="text-gray-500">
                    Nenhum item adicionado ao pedido
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2: Formulário do Cliente e Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
            <CardDescription>
              Preencha as informações do cliente e pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="orderForm"
              onSubmit={handleSubmit(onSubmitOrder)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="font-medium">Dados do Cliente</h3>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome*</Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    placeholder="Nome do cliente"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    {...register("customerEmail")}
                    placeholder="email@exemplo.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-500">
                      {errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone*</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500">
                      {errors.customerPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Pagamento</h3>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento*</Label>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="cartao_credito">
                            Cartão de Crédito
                          </SelectItem>
                          <SelectItem value="cartao_debito">
                            Cartão de Débito
                          </SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.paymentMethod && (
                    <p className="text-sm text-red-500">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingFee">Frete (R$)</Label>
                  <Input
                    id="shippingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("shippingFee")}
                  />
                  {errors.shippingFee && (
                    <p className="text-sm text-red-500">
                      {errors.shippingFee.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (R$)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("discount")}
                  />
                  {errors.discount && (
                    <p className="text-sm text-red-500">
                      {errors.discount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    {...register("notes")}
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {subtotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Controller
                    control={control}
                    name="discount"
                    render={({ field }) => (
                      <>
                        <span>Desconto:</span>
                        <span className="text-red-500">
                          -
                          {parseFloat(
                            String(field.value || "0")
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </>
                    )}
                  />
                </div>
                <div className="flex justify-between">
                  <Controller
                    control={control}
                    name="shippingFee"
                    render={({ field }) => (
                      <>
                        <span>Frete:</span>
                        <span>
                          {parseFloat(
                            String(field.value || "0")
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </>
                    )}
                  />
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <Controller
                    control={control}
                    name="discount"
                    render={({ field: discountField }) => (
                      <Controller
                        control={control}
                        name="shippingFee"
                        render={({ field: shippingField }) => (
                          <>
                            <span>Total:</span>
                            <span>
                              {calculateTotal({
                                discount: parseFloat(
                                  discountField.value || "0"
                                ),
                                shippingFee: parseFloat(
                                  shippingField.value || "0"
                                ),
                              }).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </>
                        )}
                      />
                    )}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="orderForm"
              className="w-full bg-moto-red hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Processando...
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Finalizar Pedido
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Dialog para selecionar a quantidade do produto */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Selecione a quantidade desejada
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="py-4">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-moto-red font-medium mt-1">
                    {selectedProduct.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantidade (Disponível: {selectedProduct.stock})
                </Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          selectedProduct.stock,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-20 mx-2 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.min(selectedProduct.stock, prev + 1)
                      )
                    }
                    disabled={quantity >= selectedProduct.stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex justify-between font-medium mt-4">
                <span>Total:</span>
                <span>
                  {(selectedProduct.price * quantity).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={addItemToOrder}
              className="bg-moto-red hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar ao Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de sucesso */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle2 className="text-green-500 mr-2 h-6 w-6" />
              Pedido Finalizado com Sucesso
            </DialogTitle>
            <DialogDescription>
              Número do pedido:{" "}
              <span className="font-medium">{newOrderId}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center">
              O pedido foi registrado com sucesso no sistema.
            </p>
          </div>

          <DialogFooter>
            <Button
              onClick={resetOrder}
              className="bg-moto-red hover:bg-red-700"
            >
              Iniciar Novo Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualOrderPage;
