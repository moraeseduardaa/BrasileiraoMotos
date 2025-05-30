import { useState, useEffect } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Filter, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Tipos
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  compatibility: string[];
}

// Dados mockados para demonstração
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Kit Relação Honda CG 160",
    description:
      "Kit completo de relação para Honda CG 160 composto por coroa, corrente e pinhão.",
    price: 169.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Kit+Relação",
    category: "Transmissão",
    stock: 15,
    compatibility: [
      "Honda CG 160",
      "Honda CG 160 Fan",
      "Honda CG 160 Start",
      "Honda CG 160 Titan",
    ],
  },
  {
    id: "2",
    name: "Jogo de Pastilhas de Freio",
    description:
      "Jogo de pastilhas de freio dianteiro de alta performance para motos 160cc.",
    price: 45.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Pastilhas+Freio",
    category: "Freios",
    stock: 22,
    compatibility: [
      "Honda CG 160",
      "Honda CG 160 Fan",
      "Yamaha Factor 150",
      "Honda Bros 160",
    ],
  },
  {
    id: "3",
    name: "Óleo Motor 10W30 1L",
    description:
      "Óleo lubrificante sintético para motor 4 tempos, ideal para motos 150cc e 160cc.",
    price: 32.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Óleo+Motor",
    category: "Lubrificantes",
    stock: 45,
    compatibility: [
      "Honda CG 160",
      "Honda CG 160 Fan",
      "Honda CG 150",
      "Yamaha Factor 150",
      "Honda Bros 160",
    ],
  },
  {
    id: "4",
    name: "Filtro de Ar CG 160",
    description:
      "Filtro de ar original para Honda CG 160, proporciona melhor desempenho e economia de combustível.",
    price: 39.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Filtro+Ar",
    category: "Filtros",
    stock: 18,
    compatibility: [
      "Honda CG 160",
      "Honda CG 160 Fan",
      "Honda CG 160 Start",
      "Honda CG 160 Titan",
    ],
  },
  {
    id: "5",
    name: "Vela de Ignição",
    description: "Vela de ignição de alto desempenho para motos 160cc.",
    price: 25.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Vela+Ignição",
    category: "Elétrica",
    stock: 30,
    compatibility: [
      "Honda CG 160",
      "Honda CG 150",
      "Yamaha Factor 150",
      "Honda Bros 160",
    ],
  },
  {
    id: "6",
    name: "Bateria 5Ah",
    description:
      "Bateria selada de 5 amperes, livre de manutenção, para motos 150cc e 160cc.",
    price: 129.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Bateria",
    category: "Elétrica",
    stock: 12,
    compatibility: [
      "Honda CG 160",
      "Honda CG 150",
      "Yamaha Factor 150",
      "Honda Bros 160",
      "Yamaha YBR 150",
    ],
  },
  {
    id: "7",
    name: "Kit Cilindro CG 160",
    description:
      "Kit de cilindro completo para Honda CG 160, inclui pistão, anéis e juntas.",
    price: 349.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Kit+Cilindro",
    category: "Motor",
    stock: 8,
    compatibility: [
      "Honda CG 160",
      "Honda CG 160 Fan",
      "Honda CG 160 Start",
      "Honda CG 160 Titan",
    ],
  },
  {
    id: "8",
    name: "Amortecedor Traseiro",
    description:
      "Par de amortecedores traseiros para motos 160cc, proporciona maior conforto e estabilidade.",
    price: 159.9,
    imageUrl: "https://via.placeholder.com/100x100?text=Amortecedor",
    category: "Suspensão",
    stock: 10,
    compatibility: ["Honda CG 160", "Honda CG 160 Fan", "Honda CG 160 Start"],
  },
];

// Lista de categorias de produtos
const productCategories = [
  "Todas",
  "Transmissão",
  "Freios",
  "Lubrificantes",
  "Filtros",
  "Elétrica",
  "Motor",
  "Suspensão",
];

// Schema de validação para o formulário de produto
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  description: z
    .string()
    .min(10, "Descrição precisa ter pelo menos 10 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  stock: z.coerce
    .number()
    .min(0, "Estoque não pode ser negativo")
    .int("Estoque deve ser um número inteiro"),
  category: z.string().min(1, "Selecione uma categoria"),
  imageUrl: z.string().url("URL da imagem inválida"),
  compatibility: z
    .string()
    .array()
    .nonempty("Selecione pelo menos uma moto compatível"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const InventoryPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [stockFilter, setStockFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compatibilityOptions] = useState([
    "Honda CG 160",
    "Honda CG 160 Fan",
    "Honda CG 160 Start",
    "Honda CG 160 Titan",
    "Honda CG 150",
    "Yamaha Factor 150",
    "Honda Bros 160",
    "Yamaha YBR 150",
  ]);
  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "https://via.placeholder.com/300x300?text=Novo+Produto",
      compatibility: [],
    },
  });

  useEffect(() => {
    // Simula carregamento de dados da API
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoryFilter !== "Todas") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Filtro por estoque
    if (stockFilter === "low") {
      filtered = filtered.filter((product) => product.stock < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((product) => product.stock === 0);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const handleSearch = () => {
    applyFilters();
  };

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "https://via.placeholder.com/300x300?text=Novo+Produto",
      compatibility: [],
    });
    setSelectedCompatibility([]);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    form.reset({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl,
      compatibility: product.compatibility,
    });
    setSelectedCompatibility(product.compatibility);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleCompatibilityChange = (value: string) => {
    setSelectedCompatibility((prev) => {
      const isSelected = prev.includes(value);
      if (isSelected) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  useEffect(() => {
    if (selectedCompatibility.length > 0) {
      form.setValue(
        "compatibility",
        selectedCompatibility as [string, ...string[]]
      );
    } else {
      form.setValue("compatibility", [""] as [string, ...string[]]);
    }
  }, [selectedCompatibility, form]);

  const onSubmitAdd = async (data: ProductFormValues) => {
    setIsSaving(true);
    // Simula delay de API
    setTimeout(() => {
      const newProduct = {
        ...data,
        id: Date.now().toString(), // Gera um ID único
      };

      setProducts((prev) => [...prev, newProduct as Product]);
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso!",
      });

      setIsSaving(false);
    }, 1000);
  };

  const onSubmitEdit = async (data: ProductFormValues) => {
    if (!selectedProduct) return;

    setIsSaving(true);
    // Simula delay de API
    setTimeout(() => {
      const updatedProduct = {
        ...data,
        id: selectedProduct.id,
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? (updatedProduct as Product) : p
        )
      );
      setIsEditDialogOpen(false);

      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso!",
      });

      setIsSaving(false);
    }, 1000);
  };

  const handleDelete = () => {
    if (!selectedProduct) return;

    setIsSaving(true);
    // Simula delay de API
    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);

      toast({
        title: "Produto removido",
        description: "O produto foi removido com sucesso!",
      });

      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Estoque de Produtos</h1>
        <Button
          onClick={openAddDialog}
          className="bg-moto-red hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Utilize os filtros para encontrar produtos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">Estoque Baixo (&lt; 10)</SelectItem>
                <SelectItem value="out">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSearch}
              className="bg-moto-red hover:bg-red-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
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
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead className="w-[180px]">Produto</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover mr-3"
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {product.description}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {product.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={
                            product.stock === 0
                              ? "bg-red-500"
                              : product.stock < 10
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-gray-600">
                Nenhum produto encontrado
              </h3>
              <p className="mt-2 text-gray-500">
                Tente ajustar seus filtros ou adicione novos produtos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Adicionar Produto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo produto para adicioná-lo ao estoque
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmitAdd)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome do Produto*</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ex: Kit Relação Honda CG 160"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição*</Label>
                <Input
                  id="description"
                  {...form.register("description")}
                  placeholder="Descrição detalhada do produto"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Preço*</Label>
                <Input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  {...form.register("price")}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Estoque*</Label>
                <Input
                  type="number"
                  id="stock"
                  min="0"
                  step="1"
                  {...form.register("stock")}
                />
                {form.formState.errors.stock && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.stock.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Categoria*</Label>
                <Select
                  onValueChange={(value) => form.setValue("category", value)}
                  defaultValue={form.getValues("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories
                      .filter((c) => c !== "Todas")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="imageUrl">URL da Imagem*</Label>
                <Input
                  id="imageUrl"
                  {...form.register("imageUrl")}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="compatibility">Compatibilidade*</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {compatibilityOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`compatibility-${option}`}
                        checked={selectedCompatibility.includes(option)}
                        onChange={() => handleCompatibilityChange(option)}
                        className="mr-2"
                      />
                      <Label htmlFor={`compatibility-${option}`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.compatibility && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.compatibility.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-moto-red hover:bg-red-700"
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Adicionar Produto
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmitEdit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome do Produto*</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ex: Kit Relação Honda CG 160"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição*</Label>
                <Input
                  id="description"
                  {...form.register("description")}
                  placeholder="Descrição detalhada do produto"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Preço*</Label>
                <Input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  {...form.register("price")}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Estoque*</Label>
                <Input
                  type="number"
                  id="stock"
                  min="0"
                  step="1"
                  {...form.register("stock")}
                />
                {form.formState.errors.stock && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.stock.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Categoria*</Label>
                <Select
                  onValueChange={(value) => form.setValue("category", value)}
                  defaultValue={form.getValues("category")}
                  value={form.getValues("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories
                      .filter((c) => c !== "Todas")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="imageUrl">URL da Imagem*</Label>
                <Input
                  id="imageUrl"
                  {...form.register("imageUrl")}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="compatibility">Compatibilidade*</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {compatibilityOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`compatibility-edit-${option}`}
                        checked={selectedCompatibility.includes(option)}
                        onChange={() => handleCompatibilityChange(option)}
                        className="mr-2"
                      />
                      <Label htmlFor={`compatibility-edit-${option}`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.compatibility && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.compatibility.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-moto-red hover:bg-red-700"
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Excluir Produto */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Produto</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O produto será permanentemente
              removido do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedProduct && (
              <div className="flex items-center space-x-4">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">
                    ID: {selectedProduct.id}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Produto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
