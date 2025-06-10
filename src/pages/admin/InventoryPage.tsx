import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
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
import { Search, Plus, Edit, Trash2, Filter, Save, X } from "lucide-react";
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
  featured?: boolean;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  colors?: ProductColor[];
}

interface ProductColor {
  name: string;
  hexCode: string;
  stock: number;
  imageUrl?: string;
}

interface Moto {
  id: string;
  name: string;
  brand: string;
  yearStart?: number;
  yearEnd?: number;
}

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
  featured: z.boolean().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  colors: z
    .object({
      name: z.string(),
      hexCode: z.string(),
      stock: z.coerce.number().min(0),
      imageUrl: z.string().optional(),
    })
    .array()
    .optional(),
});

const motoSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  brand: z.string().min(2, "Marca precisa ter pelo menos 2 caracteres"),
  yearStart: z.coerce.number().optional(),
  yearEnd: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;
type MotoFormValues = z.infer<typeof motoSchema>;

// Componentes auxiliares
const ProductColorsManager = ({ colors, setColors }) => {
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });

  const predefinedColors = [
    { name: "Preto", hex: "#000000" },
    { name: "Branco", hex: "#FFFFFF" },
    { name: "Vermelho", hex: "#DC2626" },
    { name: "Azul", hex: "#2563EB" },
    { name: "Prata", hex: "#94A3B8" },
    { name: "Dourado", hex: "#F59E0B" },
    { name: "Verde", hex: "#16A34A" },
    { name: "Laranja", hex: "#EA580C" },
    { name: "Cinza", hex: "#6B7280" },
    { name: "Amarelo", hex: "#EAB308" },
  ];

  const addColor = (color) => {
    if (!colors.find((c) => c.hexCode === color.hex)) {
      setColors([
        ...colors,
        { name: color.name, hexCode: color.hex, stock: 0 },
      ]);
    }
  };

  const addCustomColor = () => {
    if (
      newColor.name.trim() &&
      !colors.find((c) => c.hexCode === newColor.hex)
    ) {
      setColors([
        ...colors,
        { name: newColor.name, hexCode: newColor.hex, stock: 0 },
      ]);
      setNewColor({ name: "", hex: "#000000" });
    }
  };

  const removeColor = (index) => {
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <Label>Cores do Produto</Label>

      {colors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">
            Cores Selecionadas:
          </h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border"
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
                <span className="text-sm text-gray-700">{color.name}</span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-600">Cores Comuns:</h4>
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => addColor(color)}
              className={`flex items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                colors.find((c) => c.hexCode === color.hex)
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
              disabled={colors.find((c) => c.hexCode === color.hex)}
            >
              <div
                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <span className="truncate">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-600">
          Cor Personalizada:
        </h4>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Nome da cor"
            value={newColor.name}
            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
            className="flex-1"
          />
          <input
            type="color"
            value={newColor.hex}
            onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <Button
            type="button"
            onClick={addCustomColor}
            disabled={!newColor.name.trim()}
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

const Filters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  handleSearch,
  productCategories,
}) => (
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
        <Button onClick={handleSearch} className="bg-moto-red hover:bg-red-700">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ProductTable = ({
  loading,
  filteredProducts,
  openEditDialog,
  openDeleteDialog,
}) => (
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
                  <TableCell className="font-medium">{product.id}</TableCell>
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
);

// Tela principal
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

  const [compatibilityOptions, setCompatibilityOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [productCategories, setProductCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchMotoModels = async () => {
      try {
        const { data, error } = await supabase
          .from("modelos_moto")
          .select("id, nome, marca");

        if (error) {
          console.error("Erro ao buscar modelos de moto:", error);
          return;
        }

        const motoModels = data.map((model) => ({
          id: model.id,
          name: `${model.nome} (${model.marca})`,
        }));
        setCompatibilityOptions(motoModels);
      } catch (error) {
        console.error("Erro inesperado ao buscar modelos de moto:", error);
      }
    };

    fetchMotoModels();
  }, []);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      try {
        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categorias")
          .select("id, nome");

        if (categoriesError) {
          console.error("Erro ao buscar categorias:", categoriesError);
          return;
        }

        const fetchedCategories = categoriesData.map(
          (category) => category.nome
        );
        setProductCategories(["Todas", ...fetchedCategories]);

        // Buscar produtos
        const { data: productsData, error: productsError } = await supabase
          .from("produtos")
          .select(
            "id, nome, descricao, preco, estoque, categoria_id, imagem_url, destaque, peso, altura, largura, comprimento"
          );

        if (productsError) {
          console.error("Erro ao buscar produtos:", productsError);
          return;
        }

        const fetchedProducts = productsData.map((product) => ({
          id: product.id,
          name: product.nome,
          description: product.descricao,
          price: product.preco,
          stock: product.estoque,
          category:
            categoriesData.find((cat) => cat.id === product.categoria_id)
              ?.nome || "",
          imageUrl: product.imagem_url,
          featured: product.destaque,
          weight: product.peso,
          height: product.altura,
          width: product.largura,
          length: product.comprimento,
          compatibility: [], // Placeholder, ajustar se necessário
          colors: [], // Placeholder, ajustar se necessário
        }));

        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Erro inesperado ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo selecionado para upload.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileName = `${Date.now()}-${imageFile.name}`;
      console.log("Iniciando upload da imagem:", fileName);

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, imageFile);

      if (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        toast({
          title: "Erro",
          description: `Falha ao enviar a imagem: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log("Upload concluído. Caminho do arquivo:", data.path);

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        console.error("Erro ao obter a URL pública:", data.path);
        toast({
          title: "Erro",
          description: "Não foi possível obter a URL pública da imagem.",
          variant: "destructive",
        });
        return null;
      }

      console.log("URL pública gerada:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Erro inesperado ao fazer upload da imagem:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao enviar a imagem.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [isAddMotoDialogOpen, setIsAddMotoDialogOpen] = useState(false);

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
      featured: false,
      weight: undefined,
      height: undefined,
      width: undefined,
      length: undefined,
      colors: [],
    },
  });

  const motoForm = useForm<MotoFormValues>({
    resolver: zodResolver(motoSchema),
    defaultValues: {
      name: "",
      brand: "",
      yearStart: undefined,
      yearEnd: undefined,
    },
  });

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "Todas") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (stockFilter === "low") {
      filtered = filtered.filter((product) => product.stock < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((product) => product.stock === 0);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, stockFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
      featured: false,
      weight: undefined,
      height: undefined,
      width: undefined,
      length: undefined,
      colors: [],
    });
    setSelectedCompatibility([]);
    setImageFile(null);
  };

  const resetMotoForm = () => {
    motoForm.reset({
      name: "",
      brand: "",
      yearStart: undefined,
      yearEnd: undefined,
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openAddMotoDialog = () => {
    resetMotoForm();
    setIsAddMotoDialogOpen(true);
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
      featured: product.featured,
      weight: product.weight,
      height: product.height,
      width: product.width,
      length: product.length,
      colors: product.colors,
    });
    setSelectedCompatibility(product.compatibility);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleCompatibilityChange = (id: string) => {
    setSelectedCompatibility((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  useEffect(() => {
    if (selectedCompatibility.length > 0) {
      if (selectedCompatibility.length > 0) {
        form.setValue("compatibility", [
          selectedCompatibility[0],
          ...selectedCompatibility.slice(1),
        ]);
      } else {
        form.setValue("compatibility", [""]);
      }
    } else {
      form.setValue("compatibility", [""]);
    }
  }, [selectedCompatibility, form]);

  const onSubmitAdd = async (data: ProductFormValues) => {
    setIsSaving(true);

    try {
      const imageUrl = await handleImageUpload();
      if (!imageUrl) {
        setIsSaving(false);
        return;
      }

      const newProduct = {
        id: crypto.randomUUID(),
        nome: data.name,
        descricao: data.description,
        preco: data.price,
        estoque: data.stock,
        categoria_id: null,
        imagem_url: imageUrl,
        destaque: data.featured || false,
        peso: data.weight || null,
        altura: data.height || null,
        largura: data.width || null,
        comprimento: data.length || null,
      };

      const { data: productData, error: productError } = await supabase
        .from("produtos")
        .insert([newProduct])
        .select();

      if (productError) {
        console.error("Erro ao adicionar produto:", productError);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o produto.",
          variant: "destructive",
        });
        return;
      }

      if (data.colors && data.colors.length > 0) {
        const colors = data.colors.map((color) => ({
          id: crypto.randomUUID(),
          product_id: productData[0].id,
          name: color.name,
          hex_code: color.hexCode,
          stock: color.stock,
          image_url: color.imageUrl || null,
        }));

        const { error: colorError } = await supabase
          .from("product_colors")
          .insert(colors);

        if (colorError) {
          console.error("Erro ao adicionar cores:", colorError);
          toast({
            title: "Erro",
            description: "Não foi possível adicionar as cores do produto.",
            variant: "destructive",
          });
          return;
        }
      }

      setProducts((prev) => [
        ...prev,
        {
          id: productData[0].id,
          name: newProduct.nome,
          description: newProduct.descricao,
          price: newProduct.preco,
          imageUrl: newProduct.imagem_url,
          category: newProduct.categoria_id || "",
          stock: newProduct.estoque,
          compatibility: [],
          featured: newProduct.destaque,
          weight: newProduct.peso,
          height: newProduct.altura,
          width: newProduct.largura,
          length: newProduct.comprimento,
          colors: [],
        },
      ]);
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro inesperado ao adicionar produto:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitAddMoto = async (data: MotoFormValues) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("modelos_moto").insert([
        {
          id: crypto.randomUUID(),
          nome: data.name,
          marca: data.brand,
          ano_inicio: data.yearStart,
          ano_fim: data.yearEnd,
        },
      ]);

      if (error) {
        console.error("Erro ao adicionar moto:", error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a moto.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Moto adicionada",
        description: "A moto foi adicionada com sucesso!",
      });

      const { data: updatedData, error: fetchError } = await supabase
        .from("modelos_moto")
        .select("id, nome, marca");

      if (!fetchError) {
        const updatedMotoModels = updatedData.map((model) => ({
          id: model.id,
          name: `${model.nome} (${model.marca})`,
        }));
        setCompatibilityOptions(updatedMotoModels);
      }

      setIsAddMotoDialogOpen(false);
      resetMotoForm();
    } catch (error) {
      console.error("Erro inesperado ao adicionar moto:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitEdit = async (data: ProductFormValues) => {
    if (!selectedProduct) return;

    setIsSaving(true);
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
        <div className="flex gap-4">
          <Button
            onClick={openAddDialog}
            className="bg-moto-red hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
          <Button
            onClick={openAddMotoDialog}
            className="bg-moto-red hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Moto
          </Button>
        </div>
      </div>

      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        handleSearch={handleSearch}
        productCategories={productCategories}
      />

      <ProductTable
        loading={loading}
        filteredProducts={filteredProducts}
        openEditDialog={openEditDialog}
        openDeleteDialog={openDeleteDialog}
      />

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
            <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
              <div>
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

              <div>
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
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  type="number"
                  id="weight"
                  step="0.01"
                  {...form.register("weight")}
                />
              </div>

              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  type="number"
                  id="height"
                  step="0.01"
                  {...form.register("height")}
                />
              </div>

              <div>
                <Label htmlFor="width">Largura (cm)</Label>
                <Input
                  type="number"
                  id="width"
                  step="0.01"
                  {...form.register("width")}
                />
              </div>

              <div>
                <Label htmlFor="length">Comprimento (cm)</Label>
                <Input
                  type="number"
                  id="length"
                  step="0.01"
                  {...form.register("length")}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="featured"
                  {...form.register("featured")}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="text-sm">
                  Destaque
                </Label>
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
                <Label htmlFor="image">Imagem do Produto*</Label>
                <Input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imageFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Imagem selecionada: {imageFile.name}
                  </p>
                )}
              </div>

              <div>
                <ProductColorsManager
                  colors={form.getValues("colors") || []}
                  setColors={(colors) => form.setValue("colors", colors)}
                />
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

      {/* Dialog de Adicionar Moto */}
      <Dialog open={isAddMotoDialogOpen} onOpenChange={setIsAddMotoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Moto</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova moto para adicioná-la ao sistema
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={motoForm.handleSubmit(onSubmitAddMoto)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome da Moto*</Label>
                <Input
                  id="name"
                  {...motoForm.register("name")}
                  placeholder="Ex: Honda CG 160"
                />
                {motoForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {motoForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="brand">Marca*</Label>
                <Input
                  id="brand"
                  {...motoForm.register("brand")}
                  placeholder="Ex: Honda"
                />
                {motoForm.formState.errors.brand && (
                  <p className="text-sm text-red-500 mt-1">
                    {motoForm.formState.errors.brand.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="yearStart">Ano de Início</Label>
                <Input
                  type="number"
                  id="yearStart"
                  {...motoForm.register("yearStart")}
                />
                {motoForm.formState.errors.yearStart && (
                  <p className="text-sm text-red-500 mt-1">
                    {motoForm.formState.errors.yearStart.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="yearEnd">Ano de Fim</Label>
                <Input
                  type="number"
                  id="yearEnd"
                  {...motoForm.register("yearEnd")}
                />
                {motoForm.formState.errors.yearEnd && (
                  <p className="text-sm text-red-500 mt-1">
                    {motoForm.formState.errors.yearEnd.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddMotoDialogOpen(false)}
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
                    Adicionar Moto
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
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`compatibility-edit-${option.id}`}
                        checked={selectedCompatibility.includes(option.id)}
                        onChange={() => handleCompatibilityChange(option.id)}
                        className="mr-2"
                      />
                      <Label htmlFor={`compatibility-edit-${option.id}`}>
                        {option.name}
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
