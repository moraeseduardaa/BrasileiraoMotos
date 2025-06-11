import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
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
import { Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Tipos
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  compatibility: Model[];
  featured?: boolean;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  colors?: ProductColor[];
}

interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  stock: number;
  imageUrl?: string;
}

interface Model {
  id: string;
  nome: string;
  marca: string;
  ano_inicio: number;
  ano_fim: number;
}

// Componentes auxiliares
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
    <CardHeader className="pb-2">
      <CardTitle>Filtros</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
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
          <SelectTrigger>
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

const ProductTable = ({ loading, filteredProducts, onEdit }) => (
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                    {product.id.slice(0, 8)}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                    >
                      Editar
                    </Button>
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

const InventoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [colors, setColors] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { data: productsData } = await supabase
          .from("produtos")
          .select(
            "id, nome, descricao, preco, estoque, categoria_id, imagem_url, destaque, peso, altura, largura, comprimento"
          );

        const { data: categoriesData } = await supabase
          .from("categorias")
          .select("id, nome");

        const { data: modelsData } = await supabase
          .from("modelos_moto")
          .select("id, nome, marca, ano_inicio, ano_fim");

        const { data: colorsData } = await supabase
          .from("product_colors")
          .select("id, product_id, name, hex_code, stock, image_url");

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
          compatibility: modelsData.filter((model) =>
            colorsData.some((color) => color.product_id === product.id)
          ),
          colors: colorsData.filter((color) => color.product_id === product.id),
        }));

        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        setCategories(categoriesData);
        setModels(modelsData);
        setColors(colorsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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

  const uploadImage = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("Nenhum arquivo foi fornecido para upload.");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Não foi possível obter a URL pública da imagem.");
      }

      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleSaveProduct = async () => {
    try {
      let imageUrl = editingProduct.imageUrl;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { error } = await supabase
        .from("produtos")
        .update({
          nome: editingProduct.name,
          descricao: editingProduct.description,
          preco: editingProduct.price,
          estoque: editingProduct.stock,
          categoria_id: categories.find(
            (cat) => cat.nome === editingProduct.category
          )?.id,
          imagem_url: imageUrl,
        })
        .eq("id", editingProduct.id);

      if (error) {
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Produto atualizado com sucesso!" });
      setEditingProduct(null);
      setSelectedImage(null); // Limpa a imagem selecionada
      fetchInitialData(); // Atualiza a lista de produtos
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const handleEditColor = (color) => {
    setEditingColor(color);
  };

  const handleSaveColor = async () => {
    try {
      const { error } = await supabase
        .from("product_colors")
        .update({
          name: editingColor.name,
          hex_code: editingColor.hexCode,
          stock: editingColor.stock,
          image_url: editingColor.imageUrl,
        })
        .eq("id", editingColor.id);

      if (error) {
        toast({
          title: "Erro ao salvar cor",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Cor atualizada com sucesso!" });
      setEditingColor(null);
      fetchInitialData(); // Atualiza a lista de cores
    } catch (error) {
      console.error("Erro ao salvar cor:", error);
    }
  };

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Estoque de Produtos</h1>
      </div>

      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        handleSearch={handleSearch}
        productCategories={["Todas", ...categories.map((cat) => cat.nome)]}
      />

      <ProductTable
        loading={loading}
        filteredProducts={filteredProducts}
        onEdit={handleEditProduct}
      />

      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Preço</Label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={editingProduct.category}
                  onValueChange={(value) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nome}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Imagem do Produto</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setSelectedImage(file || null);
                  }}
                />
                {selectedImage && (
                  <p className="text-sm text-green-600 mt-1">
                    Arquivo selecionado: {selectedImage.name}
                  </p>
                )}
                {!selectedImage && editingProduct.imageUrl && (
                  <p className="text-sm text-gray-500 mt-1">
                    Imagem atual:{" "}
                    <a
                      href={editingProduct.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Visualizar
                    </a>
                  </p>
                )}
              </div>
              <div>
                <Label>Compatibilidade</Label>
                <Select
                  multiple
                  value={editingProduct.compatibility.map((model) => model.id)}
                  onValueChange={(values) =>
                    setEditingProduct({
                      ...editingProduct,
                      compatibility: models.filter((model) =>
                        values.includes(model.id)
                      ),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione modelos compatíveis" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.nome} ({model.marca} - {model.ano_inicio} a{" "}
                        {model.ano_fim})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cores</Label>
                <div className="space-y-2">
                  {editingProduct.colors.map((color) => (
                    <div
                      key={color.id}
                      className="flex items-center justify-between border p-2 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-6 w-6 rounded-full"
                          style={{ backgroundColor: color.hexCode }}
                        ></div>
                        <span>{color.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditColor(color)}
                      >
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingColor && (
        <Dialog
          open={!!editingColor}
          onOpenChange={() => setEditingColor(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editingColor.name}
                  onChange={(e) =>
                    setEditingColor({ ...editingColor, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Código Hexadecimal</Label>
                <Input
                  value={editingColor.hexCode}
                  onChange={(e) =>
                    setEditingColor({
                      ...editingColor,
                      hexCode: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input
                  type="number"
                  value={editingColor.stock}
                  onChange={(e) =>
                    setEditingColor({
                      ...editingColor,
                      stock: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={editingColor.imageUrl}
                  onChange={(e) =>
                    setEditingColor({
                      ...editingColor,
                      imageUrl: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingColor(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveColor}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InventoryPage;
